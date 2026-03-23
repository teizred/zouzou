import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { maybe } from '@/db/schema'
import { desc, eq, and, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { getPartnerId } from '@/lib/couple'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partnerId = await getPartnerId(user.id)
    const condition = partnerId 
      ? or(eq(maybe.userId, user.id), and(eq(maybe.userId, partnerId), eq(maybe.isShared, true)))
      : eq(maybe.userId, user.id)

    const entries = await db.select().from(maybe).where(condition).orderBy(desc(maybe.createdAt))
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('MAYBE_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, isShared } = await req.json()
    const entry = await db.insert(maybe).values({ text, userId: user.id, isShared: !!isShared }).returning()
    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('MAYBE_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    const partnerId = await getPartnerId(user.id)
    const accessCondition = partnerId 
      ? or(eq(maybe.userId, user.id), and(eq(maybe.userId, partnerId), eq(maybe.isShared, true)))
      : eq(maybe.userId, user.id)

    await db.delete(maybe).where(and(eq(maybe.id, id), accessCondition))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('MAYBE_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
