import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { messages, sessions } from '@/db/schema'
import { asc, eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json([])
    
    // Verify session ownership
    const sessionDoc = await db.select().from(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)))
    if (!sessionDoc.length) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const msgs = await db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(asc(messages.createdAt))
    return NextResponse.json(msgs)
  } catch (error: any) {
    console.error('MESSAGES_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId, role, content } = await req.json()

    // Verify session ownership
    const sessionDoc = await db.select().from(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)))
    if (!sessionDoc.length) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const msg = await db.insert(messages).values({ sessionId, role, content }).returning()
    return NextResponse.json(msg[0])
  } catch (error: any) {
    console.error('MESSAGES_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}