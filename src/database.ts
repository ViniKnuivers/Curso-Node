import knexPkg from 'knex'
import { env } from './env'

export const knex = knexPkg({
    client: 'sqlite3',
    connection: {
        filename: env.DATABASE_URL,
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    }
})