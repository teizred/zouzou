import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const diary = pgTable('diary', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow()
})

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  vote: text('vote').default('null'),
  createdAt: timestamp('created_at').defaultNow()
})

export const maybe = pgTable('maybe', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})