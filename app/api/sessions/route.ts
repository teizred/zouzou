import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sessions, messages } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allSessions = await db.select().from(sessions).orderBy(desc(sessions.createdAt)).limit(10)
    return NextResponse.json(allSessions)
  } catch (error: any) {
    console.error('SESSIONS_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json()
    
    // Garde max 10 sessions — supprime la plus ancienne si besoin
    const allSessions = await db.select().from(sessions).orderBy(desc(sessions.createdAt))
    if (allSessions.length >= 10) {
      const oldest = allSessions[allSessions.length - 1]
      await db.delete(messages).where(eq(messages.sessionId, oldest.id))
      await db.delete(sessions).where(eq(sessions.id, oldest.id))
    }

    const session = await db.insert(sessions).values({ title }).returning()
    return NextResponse.json(session[0])
  } catch (error: any) {
    console.error('SESSIONS_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
    }

    // Supprime d'abord les messages liés
    await db.delete(messages).where(eq(messages.sessionId, id))
    // Puis la session
    await db.delete(sessions).where(eq(sessions.id, id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SESSIONS_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const { title } = await req.json()

    if (!id || !title) {
      return NextResponse.json({ error: 'Missing id or title' }, { status: 400 })
    }

    const updated = await db.update(sessions)
      .set({ title })
      .where(eq(sessions.id, id))
      .returning()

    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('SESSIONS_PATCH_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}