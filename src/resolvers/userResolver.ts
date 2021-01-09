import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import argon2 from 'argon2'
import { Users } from '../entities/users'
import { Recipes } from '../entities/recipes'
import { LoginInput, RegisterInput } from '../types/userTypes'
import { MyContext, RecipesWithTotalPages } from '../types'
import { generateToken, verifyToken } from '../utils/auth'
import { tokenPrefix, __LIMIT__ } from '../constants'

@Resolver()
export class UserResolver {
  @Query(() => Users, { nullable: true })
  async me(
    @Ctx() { req }: MyContext
  ) {
    let user = null
    try {
      user = verifyToken(req.cookies[tokenPrefix])
    } catch (err) {
      user = null
    }
    return user
  }

  @Query(() => RecipesWithTotalPages)
  async userRecipes(
    @Arg('page') page: number,
    @Ctx() { user }: MyContext
  ): Promise<RecipesWithTotalPages> {
    const skip = (+page - 1) * __LIMIT__

    const recipes = await Recipes.createQueryBuilder('recipes')
      .select(['recipes.id', 'recipes.title', 'recipes.thumbnail', 'recipes.slug', 'recipes.created_at', 'categories.title', 'users.name'])
      .innerJoin('recipes.category', 'categories')
      .innerJoin('recipes.user', 'users')
      .where("recipes.user_id = :id", { id: user?.id })
      .orderBy('recipes.created_at', 'DESC')
      .offset(skip)
      .limit(__LIMIT__)
      .getMany()

    const totalRows = await Recipes.findAndCount({ where: { user_id: user?.id } })

    return {
      recipes,
      totalPages: totalRows[1] > 0 ? Math.ceil(totalRows[1] / __LIMIT__) : 0
    }
  }


  @Mutation(() => Users)
  async register(
    @Arg('registerInput') { name, username, password }: RegisterInput,
    @Ctx() { res }: MyContext
  ): Promise<Users> {
    const user = await Users.findOne({ where: { username } })
    if (user) {
      throw new Error('user is exists.')
    }
    const hashedPassword = await argon2.hash(password)
    await Users.create({ name, username, password: hashedPassword }).save()
    const updatedUser = await Users.findOne({ where: { username } })
    const token = generateToken(updatedUser!)
    res.cookie(tokenPrefix, token, { maxAge: 1000 * 60 * 60 * 24, sameSite: 'lax', httpOnly: true })
    return updatedUser!
  }

  @Mutation(() => Users)
  async login(
    @Arg('loginInput') { username, password }: LoginInput,
    @Ctx() { res }: MyContext
  ): Promise<Users> {
    const user = await Users.findOne({ where: { username } })
    if (!user) {
      throw new Error('user is not exists.')
    }
    const isMatched = await argon2.verify(user.password, password)
    if (!isMatched) {
      throw new Error('password is not correct.')
    }
    const token = generateToken(user)
    res.cookie(tokenPrefix, token, { maxAge: 1000 * 60 * 60 * 24, sameSite: 'lax', httpOnly: true })
    return user
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { res }: MyContext
  ) {
    res.clearCookie(tokenPrefix)
    return true
  }

  @Mutation(() => Users)
  async updateAvatar(
    @Arg('avatar') avatar: string,
    @Ctx() { res, user }: MyContext
  ): Promise<Users> {
    if (!user) {
      throw new Error('You are not authorized.')
    }
    await Users.update({ id: user.id }, { avatar })
    const updatedUser = await Users.findOne({ id: user.id })
    const token = generateToken(updatedUser!)
    res.cookie(tokenPrefix, token, { maxAge: 1000 * 60 * 60 * 24, sameSite: 'lax', httpOnly: true })
    return updatedUser!
  }
}