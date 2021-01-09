import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Recipes } from "./recipes";

@ObjectType()
@Entity()
export class Categories extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => String)
  @Column({
    type: 'varchar',
    length: 20,
    unique: true
  })
  title: string

  @Field(() => Date)
  @CreateDateColumn()
  created_at: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updated_at: Date

  @Field(() => [Recipes])
  @OneToMany(() => Recipes, recipes => recipes.category)
  recipes: Recipes[]
}