import { NextResponse } from 'next/server'
import { db } from '@/db'
import { couples } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await getCouple(user.id)
    if (existing) {
      return NextResponse.json({ error: 'Already in a couple or pending invite' }, { status: 400 })
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const couple = await db.insert(couples).values({
      user1Id: user.id,
      inviteCode,
      status: 'pending'
    }).returning()

    return NextResponse.json(couple[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
