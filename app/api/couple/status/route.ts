import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const couple = await getCouple(user.id)
    return NextResponse.json({ couple })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
