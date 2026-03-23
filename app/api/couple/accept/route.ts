import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { couples } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await getCouple(user.id)
    if (existing) {
      return NextResponse.json({ error: 'Already in a couple or pending invite' }, { status: 400 })
    }

    const { inviteCode } = await req.json()
    if (!inviteCode) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const invite = await db.select().from(couples).where(and(eq(couples.inviteCode, inviteCode), eq(couples.status, 'pending'))).limit(1)
    if (!invite.length) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })

    const couple = await db.update(couples)
      .set({ user2Id: user.id, status: 'accepted' })
      .where(eq(couples.id, invite[0].id))
      .returning()

    return NextResponse.json(couple[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
