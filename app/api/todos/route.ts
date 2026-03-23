import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, desc, and, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { getPartnerId } from '@/lib/couple'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partnerId = await getPartnerId(user.id)
    const condition = partnerId 
      ? or(eq(todos.userId, user.id), and(eq(todos.userId, partnerId), eq(todos.isShared, true)))
      : eq(todos.userId, user.id)

    const list = await db.select().from(todos).where(condition).orderBy(desc(todos.createdAt))
    return NextResponse.json(list)
  } catch (error: any) {
    console.error('TODOS_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, isShared } = await req.json()
    const todo = await db.insert(todos).values({ text, userId: user.id, isShared: !!isShared }).returning()
    return NextResponse.json(todo[0])
  } catch (error: any) {
    console.error('TODOS_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, vote } = await req.json()
    const partnerId = await getPartnerId(user.id)
    const accessCondition = partnerId 
      ? or(eq(todos.userId, user.id), and(eq(todos.userId, partnerId), eq(todos.isShared, true)))
      : eq(todos.userId, user.id)

    const updated = await db.update(todos).set({ vote }).where(and(eq(todos.id, id), accessCondition)).returning()
    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('TODOS_PATCH_ERROR:', error)
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
      ? or(eq(todos.userId, user.id), and(eq(todos.userId, partnerId), eq(todos.isShared, true)))
      : eq(todos.userId, user.id)

    const deleted = await db.delete(todos).where(and(eq(todos.id, id), accessCondition)).returning()
    return NextResponse.json(deleted[0])
  } catch (error: any) {
    console.error('TODOS_DELETE_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}