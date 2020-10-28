import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Comment } from '../entities/Comment';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

// Type for Comment
@InputType()
class CommentInput {
  @Field()
  postId: number;
  @Field()
  text: string;
}

@Resolver(Comment)
export class CommentResolver {
  // Get user
  @FieldResolver(() => User)
  user(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.userId);
  }

  // Read one comment
  @Query(() => Comment, { nullable: true })
  comment(@Arg('id', () => Int) id: number): Promise<Comment | undefined> {
    return Comment.findOne(id);
  }

  // Read post comments
  @Query(() => [Comment])
  async postComments(
    @Arg('postId', () => Int) postId: number
  ): Promise<Comment[]> {
    return await Comment.find({
      where: { postId },
      order: { updatedAt: 'DESC' },
    });
  }

  // Create
  @Mutation(() => Comment)
  @UseMiddleware(isAuth) // check to see user is logged in
  async createComment(
    @Arg('input') input: CommentInput,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    return Comment.create({
      ...input,
      userId: req.session.userId,
    }).save();
  }

  // Update
  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg('id', () => Int) id: number,
    @Arg('text', () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const comment = await Comment.findOne(id);
    if (!comment) {
      return null;
    }
    if (
      comment.userId !== req.session.userId &&
      req.session.username !== 'admin'
    ) {
      throw new Error('not authorized');
    }
    const result = await getConnection()
      .createQueryBuilder()
      .update(Comment)
      .set({ text })
      .where('id=:id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  // Delete
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const comment = await Comment.findOne(id);
    if (!comment) {
      return false;
    }
    if (
      comment.userId !== req.session.userId &&
      req.session.username !== 'admin'
    ) {
      throw new Error('not authorized');
    }
    await Comment.delete({ id: comment.id });
    return true;
  }
}
