import { createConnection } from 'typeorm'
import { Recipes } from '../entities/recipes'
import { Categories } from '../entities/categories'
import { Users } from '../entities/users'
import { __IS_DEV__ } from '../constants'

const connection = async () => {
  await createConnection({
    type: 'mysql',
    database: 'recipe',
    port: __IS_DEV__ ? 3307 : 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    synchronize: __IS_DEV__ ? true : false,
    entities: [
      Users,
      Recipes,
      Categories
    ],
  })
}

export default connection