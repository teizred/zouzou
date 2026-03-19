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

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull().default('New conversation'),
  createdAt: timestamp('created_at').defaultNow()
})

