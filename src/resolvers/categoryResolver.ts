import { Resolver, Mutation, Arg, Query } from "type-graphql";
import { Recipes } from "../entities/recipes";
import { Categories } from '../entities/categories'
import { __LIMIT__ } from "../constants";
import { CategoryTotalPages } from "../types/categoryTypes";
import { RecipesWithTotalPages } from "../types";

@Resolver()
export class CategoryResolver {
  @Query(() => [Categories])
  async categories() {
    const categories = await Categories
      .createQueryBuilder('categories')
      .leftJoinAndSelect('categories.recipes', 'recipes')
      .getMany()

    return categories
  }

  @Query(() => [CategoryTotalPages])
  async categoriesWithTotalPages(): Promise<CategoryTotalPages[]> {
    const categories: CategoryTotalPages[] = await Categories.query(`
      SELECT title, (SELECT CEIL(COUNT(*) / ${__LIMIT__}) FROM recipes WHERE recipes.category_id = categories.id) as total_pages FROM categories
    `)
    const result = await Recipes.findAndCount()

    categories.push({ title: 'all', total_pages: Math.ceil(result[1] / __LIMIT__) })

    return categories
  }

  @Query(() => RecipesWithTotalPages)
  async categoryPage(
    @Arg('title') title: string,
    @Arg('page') page: string = "1"
  ): Promise<RecipesWithTotalPages> {
    const skip = (parseInt(page) - 1) * __LIMIT__
    let result: any = []
    let totalRows: any = 0

    if (title === 'all') {
      result = await Recipes.createQueryBuilder('recipes')
        .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'categories.title', 'users.name', 'recipes.created_at'])
        .innerJoin("recipes.category", 'categories')
        .innerJoin("recipes.user", 'users')
        .orderBy('recipes.created_at', 'DESC')
        .limit(__LIMIT__)
        .offset(skip)
        .getMany()

      totalRows = await Recipes.createQueryBuilder('recipes')
        .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'categories.title', 'users.name'])
        .innerJoin("recipes.category", 'categories')
        .innerJoin("recipes.user", 'users')
        .getMany()
    } else {
      const category = await Categories.findOne({ where: { title } })
      result = await Recipes.createQueryBuilder('recipes')
        .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'categories.title', 'users.name', 'recipes.created_at'])
        .innerJoin("recipes.category", 'categories')
        .innerJoin("recipes.user", 'users')
        .where("recipes.category_id = :category_id", { category_id: category?.id })
        .orderBy('recipes.created_at', 'DESC')
        .limit(__LIMIT__)
        .offset(skip)
        .getMany()

      totalRows = await Recipes.createQueryBuilder('recipes')
        .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'categories.title', 'users.name'])
        .innerJoin("recipes.category", 'categories')
        .innerJoin("recipes.user", 'users')
        .where("recipes.category_id = :category_id", { category_id: category?.id })
        .getMany()
    }

    const totalPages = Math.ceil(totalRows.length / __LIMIT__)

    return {
      recipes: result,
      totalPages
    }
  }

  @Mutation(() => Categories)
  async addCategory(
    @Arg('title') title: string
  ): Promise<Categories> {
    return Categories.create({ title }).save()
  }

  @Mutation(() => Categories)
  async updateCategory(
    @Arg('id') id: number,
    @Arg('title') title: string
  ): Promise<Categories> {
    const category = await Categories.findOne({ where: { id } })
    if (!category) {
      throw new Error('category is not exists.')
    }
    await Categories.update({ id }, { title })
    return category
  }
}