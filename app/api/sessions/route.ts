import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sessions, messages } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const allSessions = await db.select().from(sessions).orderBy(desc(sessions.createdAt)).limit(10)
  return NextResponse.json(allSessions)
}

export async function POST(req: NextRequest) {
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
}

export async function DELETE(req: NextRequest) {
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
}

export async function PATCH(req: NextRequest) {
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
}