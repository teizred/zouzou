import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { diary } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const entries = await db.select().from(diary).orderBy(desc(diary.createdAt))
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('DIARY_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    const entry = await db.insert(diary).values({ text }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('DIARY_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, text } = await req.json()
    const updated = await db.update(diary).set({ text }).where(eq(diary.id, id)).returning()
    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('DIARY_PATCH_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await db.delete(diary).where(eq(diary.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DIARY_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}