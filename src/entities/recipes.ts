import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Categories } from "./categories";
import { Users } from "./users";

@ObjectType()
@Entity()
export class Recipes extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => String)
  @Column()
  title: string

  @Field(() => String)
  @Column()
  slug: string

  @Field(() => String)
  @Column({
    type: 'text'
  })
  description: string

  @Field(() => String)
  @Column({
    type: 'varchar',
    length: 200
  })
  thumbnail: string

  @Field(() => Date)
  @CreateDateColumn()
  created_at: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updated_at: Date

  @Column()
  category_id: number

  @Column()
  user_id: number

  @Field(() => Categories)
  @ManyToOne(() => Categories, categories => categories.id)
  @JoinColumn({ name: 'category_id' })
  category: Categories

  @Field(() => Users)
  @ManyToOne(() => Users, users => users.recipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users
}