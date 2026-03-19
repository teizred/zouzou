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