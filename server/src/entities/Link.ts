import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LinkType = 'image' | 'video' | 'player' | 'website';

@ObjectType()
@Entity()
export class Link extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  linkId!: number;

  @Field()
  @Column()
  linkText: string;

  @Field()
  @Column()
  url: string;

  @Field(() => String)
  @Column()
  type: LinkType;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  domain: string;

  @Field()
  @Column()
  image: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
