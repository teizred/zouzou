import { db } from '@/db'
import { couples } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

export async function getCouple(userId: string) {
  const coupleList = await db.select().from(couples)
    .where(or(eq(couples.user1Id, userId), eq(couples.user2Id, userId)))
    .limit(1)
  return coupleList[0] || null
}

export async function getPartnerId(userId: string) {
  const couple = await getCouple(userId)
  if (!couple || couple.status !== 'accepted') return null
  return couple.user1Id === userId ? couple.user2Id : couple.user1Id
}
