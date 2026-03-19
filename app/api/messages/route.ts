import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { messages } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json([])
    const msgs = await db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(asc(messages.createdAt))
    return NextResponse.json(msgs)
  } catch (error: any) {
    console.error('MESSAGES_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, role, content } = await req.json()
    const msg = await db.insert(messages).values({ sessionId, role, content }).returning()
    return NextResponse.json(msg[0])
  } catch (error: any) {
    console.error('MESSAGES_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}