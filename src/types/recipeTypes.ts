import { MinLength } from "class-validator";
import { Recipes } from "../entities/recipes";
import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class RecipesHome {
  @Field(() => [Recipes])
  feature: Recipes[]

  @Field(() => [Recipes])
  lasted: Recipes[]
}

@ObjectType()
export class RecipeSlugs {
  @Field()
  slug: string
}

@ObjectType()
export class RecipeRelateTypes {
  @Field(() => Recipes)
  recipe: Recipes

  @Field(() => [Recipes])
  relate: Recipes[]
}

@InputType()
export class RecipeInput {
  @MinLength(3)
  @Field(() => String)
  title: string

  @MinLength(10)
  @Field(() => String)
  description: string

  @Field(() => String)
  thumbnail: string

  @Field(() => Number)
  category_id: number
}

@InputType()
export class UpdateRecipeInput extends RecipeInput {
  @Field(() => Number)
  id: number
}