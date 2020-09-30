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
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';
import { Comment } from '../entities/Comment';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

// Type for Post
@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
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
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 200);
  }

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

    const replacements: any[] = [validLimitPlus];

    if (cursor) {
      replacements.push(new Date(Number(cursor)));
    }

    const posts = await getConnection().query(
      `
			SELECT p.*
			FROM post p
			${cursor ? `WHERE p."createdAt" < $2` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
			`,
      replacements
    );

    return {
      posts: posts.slice(0, validLimit),
      hasMore: posts.length === validLimitPlus,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth) // check to see user is logged in
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('text', () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorized');
    }
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id=:id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorized');
    }
    // await Post.delete({ id, creatorId: req.session.userId });
    await Post.delete({ id: post.id });
    return true;
  }
}
