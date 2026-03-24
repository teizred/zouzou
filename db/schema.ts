import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const diary = pgTable('diary', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  text: text('text').notNull(),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow()
})

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  text: text('text').notNull(),
  vote: text('vote').default('null'),
  isShared: boolean('is_shared').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const maybe = pgTable('maybe', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  text: text('text').notNull(),
  isShared: boolean('is_shared').default(false).notNull(),
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
  userId: text('user_id').notNull().default(''),
  title: text('title').notNull().default('New conversation'),
  createdAt: timestamp('created_at').defaultNow()
})

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  text: text('text').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const moods = pgTable('moods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  value: text('value').notNull(),
  note: text('note'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const weekly_summaries = pgTable('weekly_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default(''),
  weekStart: text('week_start').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

export const couples = pgTable('couples', {
  id: uuid('id').defaultRandom().primaryKey(),
  user1Id: text('user1_id').notNull(),
  user2Id: text('user2_id'),
  inviteCode: text('invite_code').notNull().unique(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow()
})

// Authentication Tables required by better-auth Drizzle Adapter
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull(),
	image: text('image'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull().references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt'),
	updatedAt: timestamp('updatedAt')
});