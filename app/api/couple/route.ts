import { NextResponse } from 'next/server'
import { db } from '@/db'
import { couples } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'
import { eq } from 'drizzle-orm'

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const couple = await getCouple(user.id)
    if (!couple) return NextResponse.json({ error: 'No couple found' }, { status: 404 })

    await db.delete(couples).where(eq(couples.id, couple.id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
