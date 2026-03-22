import { db } from '../db/index'
import { moods } from '../db/schema'
import { eq } from 'drizzle-orm'

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log('Deleting moods for date:', today)
  const res = await db.delete(moods).where(eq(moods.date, today))
  console.log('Deleted successfully.')
  process.exit(0)
}

main().catch(console.error)
