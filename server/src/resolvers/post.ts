import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { Upvote } from '../entities/Upvote';

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
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
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
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const validLimit = Math.min(50, limit);
    const validLimitPlus = validLimit + 1;

    const replacements: any[] = [validLimitPlus];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIdx = 3;

    if (cursor) {
      replacements.push(new Date(Number(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await getConnection().query(
      `
			SELECT p.*,
			json_build_object(
				'id', u.id,
				'username', u.username,
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt"
				) creator,
			${
        req.session.userId
          ? '(SELECT value FROM upvote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
          : 'null as "voteStatus"'
      }
			FROM post AS p
			INNER JOIN public.user AS u ON  u.id = p."creatorId"
			${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
			`,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(validLimitPlus);
    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', { cursor: new Date(Number(cursor)) });
    // }

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, validLimit),
      hasMore: posts.length === validLimitPlus,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
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
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if (typeof title !== 'undefined') {
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}
