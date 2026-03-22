import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { moods } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    // Fetch recent 7 days of moods
    const recent = await db.select().from(moods).orderBy(desc(moods.date)).limit(7)
    return NextResponse.json(recent)
  } catch (error: any) {
    console.error('MOODS_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { value, note, date } = await req.json()
    const entry = await db.insert(moods).values({ value: String(value), note, date }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('MOODS_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
