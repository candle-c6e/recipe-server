import dotenv from 'dotenv'
dotenv.config()
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import "reflect-metadata";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from 'apollo-server-express'
import multer from 'multer'
import connection from './database'
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/userResolver";
import { CategoryResolver } from "./resolvers/categoryResolver";
import { RecipeResolver } from "./resolvers/recipeResolver";
import { MyContext } from "./types";
import { getUser } from './utils/auth'

const PATH = '/graphql'

const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    cb(null, path.resolve(`./uploads/${req.body.path}`))
  },
  filename: function (_req, file, cb) {
    const extension = path.extname(file.originalname)
    cb(null, crypto.randomBytes(10).toString('hex') + '-' + Date.now() + extension)
  }
})

const upload = multer({ storage })

async function main() {
  const app = express()

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))

  app.use(express.json())
  app.use(cookieParser())
  app.use('/uploads', express.static(path.resolve('./uploads')))

  app.get('/me', async (req, res) => {
    const user = await getUser(req)
    res.status(200).json({
      success: user ? true : false,
      data: []
    })
  })

  app.post('/uploads', upload.any(), (req, res) => {
    const files = req.files as any
    const filename = files[0].filename
    res.status(200).json({
      success: true,
      data: filename
    })
  })

  app.delete('/delete-image', async (req, res) => {
    await fs.unlink(`${path.resolve('./uploads')}/${req.body.path}/${req.body.filename}`)
    res.status(200).json({
      success: true,
      data: []
    })
  })

  const schema = await buildSchema({
    resolvers: [UserResolver, CategoryResolver, RecipeResolver]
  })

  await connection()

  const server = new ApolloServer({
    schema,
    context: async ({ req, res }: MyContext) => {
      const user = await getUser(req)
      return { req, res, user }
    },
    formatError: (err) => {
      if (err.message.includes('ER_DUP_ENTRY')) {
        return new Error('Duplicate Value Please type again')
      }
      if (err.message.startsWith("Database Error: ") || err.message.includes('ER_NO_REFERENCED')) {
        return new Error('Internal server error');
      }
      return err;
    },
  })

  server.applyMiddleware({ app, path: PATH, cors: false })

  app.listen(6000, () => {
    console.log(`SERVER IS RUNNING 🚀`)
  })
}

main()