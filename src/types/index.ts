import { Request, Response } from 'express'
import { Field, ObjectType } from 'type-graphql';
import { Recipes } from '../entities/recipes';
import { Users } from '../entities/users';

@ObjectType()
export class RecipesWithTotalPages {
  @Field(() => [Recipes])
  recipes: Recipes[]

  @Field(() => Number)
  totalPages: number
}

export interface MyContext {
  req: Request,
  res: Response,
  user: Users | null
}

export interface Token {
  id: number,
  name: string,
  iat: number
}