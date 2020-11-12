import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, getRepository, LessThan } from 'typeorm';
import { Comment } from '../entities/Comment';
import { Link } from '../entities/Link';
import { Post } from '../entities/Post';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import classifyLink from '../utils/classifyLink';
import getPreview from '../utils/link-preview/getPreview';

// Type for Post
@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
  @Field(() => String, { nullable: true })
  linkText?: string;
  @Field(() => String, { nullable: true })
  url?: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int)
  commentCount(@Root() post: Post) {
    return Comment.count({ where: { postId: post.id } });
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return upvote ? upvote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('input', () => Int) input: number,
    @Ctx() { req }: MyContext
  ) {
    const value = input !== -1 ? 1 : -1;
    const { userId } = req.session;
    const upvote = await Upvote.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    if (upvote) {
      if (upvote.value !== value) {
        await getConnection().transaction(async (tm) => {
          await tm.query(
            `UPDATE upvote
					SET value = $1
					WHERE "postId" = $2 AND "userId" = $3
					`,
            [value, postId, userId]
          );

          await tm.query(
            `
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`,
            [2 * value, postId] // negate original vote and add new vote
          );
        });
      } else if (upvote.value === value) {
        await getConnection().transaction(async (tm) => {
          await tm.query(
            `DELETE FROM upvote
					WHERE "postId" = $1 AND "userId" = $2
					`,
            [postId, userId]
          );

          await tm.query(
            `
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`,
            [-value, postId] // negate original vote
          );
        });
      }
    } else if (!upvote) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
					INSERT INTO upvote ("userId", "postId", value)
					VALUES ($1, $2, $3)
				`,
          [userId, postId, value]
        );

        await tm.query(
          `
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`,
          [value, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const validLimit = Math.min(50, limit);
    const validLimitPlus = validLimit + 1;

    const posts = await getRepository(Post).find({
      relations: ['link'],
      order: { createdAt: 'DESC' },
      take: validLimitPlus,
      ...(cursor
        ? { where: { createdAt: LessThan(new Date(Number(cursor))) } }
        : null),
    });

    return {
      posts: posts.slice(0, validLimit),
      hasMore: posts.length === validLimitPlus,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ['link'] });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth) // check to see user is logged in
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const { title, text, url, linkText } = input;

    const post = Post.create({
      title,
      text,
      creatorId: req.session.userId,
    });

    if (url) {
      const type = classifyLink(url);
      const link = Link.create({
        url,
        linkText,
        type,
        name: '',
        description: '',
        domain: '',
        image: '',
      });
      if (type === 'website') {
        const linkPreview = await getPreview(url);
        Link.merge(link, { ...linkPreview });
      }

      post.link = await link.save();
    }

    return post.save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id, { relations: ['link'] });
    if (!post) {
      return undefined;
    }

    if (
      post.creatorId !== req.session.userId &&
      req.session.username !== 'admin'
    ) {
      throw new Error('not authorized');
    }

    const { title, text, url, linkText } = input;

    if (url) {
      const type = classifyLink(url);
      const link = Link.create({
        url,
        linkText,
        type,
        name: '',
        description: '',
        domain: '',
        image: '',
      });
      if (type === 'website') {
        const linkPreview = await getPreview(url);
        Link.merge(link, { ...linkPreview });
      }

      if (post.link) {
        await Link.update({ linkId: post.link.linkId }, link);
      } else {
        post.link = await link.save();
        await post.save();
      }
    } else {
      if (post.link) {
        await Post.update({ id }, { link: undefined });
        await Link.delete({ linkId: post.link.linkId });
      }
    }

    await Post.update({ id }, { title, text });

    return Post.findOne(id, { relations: ['link'] });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id, { relations: ['link'] });
    if (!post) {
      return false;
    }
    if (
      post.creatorId !== req.session.userId &&
      req.session.username !== 'admin'
    ) {
      throw new Error('not authorized');
    }

    await Post.delete({ id: post.id });
    if (post.link) await Link.delete({ linkId: post.link.linkId });
    return true;
  }
}
