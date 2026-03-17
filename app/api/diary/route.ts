import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { diary } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const entries = await db.select().from(diary).orderBy(desc(diary.createdAt))
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const entry = await db.insert(diary).values({ text }).returning()
  return NextResponse.json(entry[0])
}

export async function PATCH(req: NextRequest) {
  const { id, text } = await req.json()
  const updated = await db.update(diary).set({ text }).where(eq(diary.id, id)).returning()
  return NextResponse.json(updated[0])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await db.delete(diary).where(eq(diary.id, id))
  return NextResponse.json({ success: true })
}