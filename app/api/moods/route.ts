import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { moods } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch recent 7 days of moods for the user
    const recent = await db.select().from(moods).where(eq(moods.userId, user.id)).orderBy(desc(moods.date)).limit(7)
    return NextResponse.json(recent)
  } catch (error: any) {
    console.error('MOODS_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { value, note, date } = await req.json()
    const entry = await db.insert(moods).values({ value: String(value), note, date, userId: user.id }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('MOODS_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
