import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { maybe } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const entries = await db.select().from(maybe).orderBy(desc(maybe.createdAt))
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('MAYBE_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    const entry = await db.insert(maybe).values({ text }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('MAYBE_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await db.delete(maybe).where(eq(maybe.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('MAYBE_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
