import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { maybe } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const entries = await db.select().from(maybe).orderBy(desc(maybe.createdAt))
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const entry = await db.insert(maybe).values({ text }).returning()
  return NextResponse.json(entry[0])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await db.delete(maybe).where(eq(maybe.id, id))
  return NextResponse.json({ success: true })
}
