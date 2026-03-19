import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Singleton connection to prevent "MaxClientsInSessionMode" errors in dev/Vercel
const globalForPostgres = globalThis as unknown as {
  postgres: postgres.Sql | undefined
}

const connectionString = process.env.DATABASE_URL!

const client = globalForPostgres.postgres || postgres(connectionString, { 
    prepare: false,
    ssl: 'require'
})

if (process.env.NODE_ENV !== 'production') globalForPostgres.postgres = client

export const db = drizzle(client, { schema })