import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

// many to many relationship
// users <-> posts
// user -> join table (upvote) <- posts

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.upvotes, { onDelete: 'CASCADE' })
  post: Post;
}
