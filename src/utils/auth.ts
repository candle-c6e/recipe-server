import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { tokenPrefix } from '../constants'
import { Users } from "../entities/users"
import { Token } from '../types'

export const generateToken = (user: Users) => {
  return jwt.sign({ id: user.id, name: user.name, avatar: user.avatar }, process.env.TOKEN_SECRET!)
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.TOKEN_SECRET!)
}

export const getUser = async (req: Request) => {
  try {
    const cookies = req.cookies || ''
    if (!cookies) {
      return null
    }
    const token = cookies[tokenPrefix]
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as Token
    const user = await Users.findOne({ where: { id: decodedToken.id } })
    return user
  } catch (err) {
    return null
  }
};