import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const list = await db.select().from(todos).orderBy(desc(todos.createdAt))
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const todo = await db.insert(todos).values({ text }).returning()
  return NextResponse.json(todo[0])
}

export async function PATCH(req: NextRequest) {
  const { id, vote } = await req.json()
  const updated = await db.update(todos).set({ vote }).where(eq(todos.id, id)).returning()
  return NextResponse.json(updated[0])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const deleted = await db.delete(todos).where(eq(todos.id, id)).returning()
  return NextResponse.json(deleted[0])
}