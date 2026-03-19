import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForPostgres = globalThis as unknown as {
  postgres: postgres.Sql | undefined
}

const connectionString = process.env.DATABASE_URL!

// Limitation de la pool localement et pooling requis sur Vercel
const client = globalForPostgres.postgres || postgres(connectionString, { 
    prepare: false,
    ssl: 'require',
    max: process.env.NODE_ENV === 'production' ? undefined : 1 // Une seule connexion en dev
})

if (process.env.NODE_ENV !== 'production') globalForPostgres.postgres = client

export const db = drizzle(client, { schema })