import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Recipes } from "./recipes";

@ObjectType()
@Entity()
export class Users extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => String)
  @Column({
    type: 'varchar',
    length: 20
  })
  name: string

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  avatar: string

  @Column({
    type: 'varchar',
    length: 50,
    unique: true
  })
  username: string

  @Column({
    type: 'varchar',
    length: 100,
  })
  password: string

  @Field(() => Date)
  @CreateDateColumn()
  created_at: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updated_at: Date

  @Field(() => [Recipes])
  @OneToMany(() => Recipes, recipes => recipes.user)
  recipes: Recipes[]
}