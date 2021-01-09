import fs from 'fs/promises'
import path from 'path'
import { Resolver, Arg, Mutation, Ctx, Query } from "type-graphql";
import Slug from 'slug'
import { Recipes } from "../entities/recipes";
import { RecipeInput, RecipeRelateTypes, RecipesHome, RecipeSlugs, UpdateRecipeInput } from "../types/recipeTypes";
import { MyContext } from "../types";

@Resolver()
export class RecipeResolver {
  @Query(() => [RecipeSlugs])
  async recipeSlugs(): Promise<RecipeSlugs[]> {
    const slugs = await Recipes.find({ select: ['slug'] })
    return slugs
  }

  @Query(() => RecipesHome)
  async recipes(): Promise<RecipesHome> {
    const recipes = await Recipes.createQueryBuilder('recipes')
      .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'categories.title', 'users.name'])
      .innerJoin('recipes.category', 'categories')
      .innerJoin('recipes.user', 'users')
      .take(4)
      .getMany()

    const lasted = await Recipes.createQueryBuilder('recipes')
      .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'recipes.created_at', 'categories.title', 'users.name'])
      .innerJoin('recipes.category', 'categories')
      .innerJoin('recipes.user', 'users')
      .orderBy('recipes.created_at', 'DESC')
      .take(4)
      .getMany()

    return {
      feature: recipes,
      lasted
    }
  }

  @Query(() => Recipes)
  async recipeById(
    @Arg('id') id: number
  ): Promise<Recipes> {
    const recipe = await Recipes.createQueryBuilder('recipes')
      .select([
        'recipes.id',
        'recipes.title',
        'recipes.thumbnail',
        'recipes.slug',
        'recipes.description',
        'recipes.created_at',
        'categories.title',
        'users.name'
      ])
      .innerJoin('recipes.category', 'categories')
      .innerJoin('recipes.user', 'users')
      .where("recipes.id = :id", { id })
      .getOne()

    if (!recipe) {
      throw new Error('Recipe is not exists.')
    }

    return recipe
  }

  @Query(() => RecipeRelateTypes)
  async recipeBySlug(
    @Arg('slug') slug: string
  ): Promise<RecipeRelateTypes> {
    const recipe = await Recipes.createQueryBuilder('recipes')
      .select([
        'recipes.id',
        'recipes.category_id',
        'recipes.title',
        'recipes.thumbnail',
        'recipes.slug',
        'recipes.description',
        'recipes.created_at',
        'categories.id',
        'categories.title',
        'users.name'
      ])
      .innerJoin('recipes.category', 'categories')
      .innerJoin('recipes.user', 'users')
      .where("recipes.slug = :slug", { slug })
      .getOne()

    if (!recipe) {
      throw new Error('Recipe is not exists.')
    }

    const relate = await Recipes.createQueryBuilder('recipes')
      .select(['recipes.id', 'recipes.title', 'recipes.slug', 'recipes.thumbnail', 'recipes.category_id'])
      .where("recipes.id NOT IN (:id)", { id: recipe.id })
      .andWhere('recipes.category_id = :category_id', { category_id: recipe.category_id })
      .orderBy('rand()')
      .take(3)
      .getMany()

    return {
      recipe,
      relate
    }
  }

  @Mutation(() => Recipes)
  async addRecipe(
    @Arg('recipeInput') { title, description, category_id, thumbnail }: RecipeInput,
    @Ctx() { user }: MyContext
  ): Promise<Recipes> {
    if (!user) {
      throw new Error('You are not authenticated.')
    }
    const slug = Slug(title)
    return await Recipes.create({ title, slug, description, category_id, user_id: user.id, thumbnail }).save()
  }

  @Mutation(() => Recipes)
  async updateRecipe(
    @Arg('recipeInput') updateRecipeInput: UpdateRecipeInput,
    @Ctx() { user }: MyContext
  ): Promise<Recipes> {
    if (!user) {
      throw new Error('You are not authenticated.')
    }
    const recipe = await Recipes.findOne({ where: { id: updateRecipeInput.id } })
    if (!recipe) {
      throw new Error('Recipe is exists.')
    }
    if (recipe.user_id !== user.id) {
      throw new Error('You are not permitted.')
    }
    const slug = Slug(updateRecipeInput.title)
    await Recipes.update({ id: updateRecipeInput.id }, { title: updateRecipeInput.title, slug, description: updateRecipeInput.description, category_id: updateRecipeInput.category_id, user_id: user.id, thumbnail: updateRecipeInput.thumbnail })
    const updatedRecipe = await Recipes.findOne({ where: { id: updateRecipeInput.id }, relations: ['category', 'user'] })
    return updatedRecipe!
  }

  @Mutation(() => Boolean)
  async deleteRecipe(
    @Arg('id') id: number,
    @Ctx() { user }: MyContext
  ) {
    if (!user) {
      throw new Error('You are not authenticated.')
    }
    const recipe = await Recipes.findOne({ where: { id } })
    if (!recipe) {
      throw new Error('Recipe is exists.')
    }
    if (recipe.user_id !== user.id) {
      throw new Error('You are not permitted.')
    }
    await fs.unlink(path.resolve(`./uploads/recipe/${recipe.thumbnail}`))
    await Recipes.delete({ id })
    return true
  }
}