import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { diary } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const entries = await db.select().from(diary).where(eq(diary.userId, userId)).orderBy(desc(diary.createdAt))
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('DIARY_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { text } = await req.json()
    const entry = await db.insert(diary).values({ text, userId }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('DIARY_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, text } = await req.json()
    const updated = await db.update(diary).set({ text }).where(and(eq(diary.id, id), eq(diary.userId, userId))).returning()
    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('DIARY_PATCH_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await req.json()
    await db.delete(diary).where(and(eq(diary.id, id), eq(diary.userId, userId)))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DIARY_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}