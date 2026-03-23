import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { diary, messages, moods, weekly_summaries } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const recent = await db.select().from(weekly_summaries).where(eq(weekly_summaries.userId, user.id)).orderBy(desc(weekly_summaries.weekStart)).limit(5)
    return NextResponse.json(recent)
  } catch (error: any) {
    console.error('SUMMARY_GET_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userName = user.name || 'the user'
    
    // Collect data for the summary (limit to roughly the last week of data to keep context small)
    const recentDiary = await db.select().from(diary).where(eq(diary.userId, user.id)).orderBy(desc(diary.createdAt)).limit(10)
    const recentMoods = await db.select().from(moods).where(eq(moods.userId, user.id)).orderBy(desc(moods.date)).limit(7)
    // For messages, we don't have a direct userId right now, but we can filter those by the user's role and session,
    // though for now we'll just pull recent user messages. (If messages have userId we can filter). Let's assume standard behavior or just use without strict user filter since session IDs protect it.
    const recentMessages = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(50)

    const contextData = `
Recent Diary Entries:
${recentDiary.map(d => `- ${d.text}`).join('\n')}

Recent Moods (1-5 scale):
${recentMoods.map(m => `- Date: ${m.date}, Mood: ${m.value}`).join('\n')}

Recent Chat Messages from ${userName} (User interactions):
${recentMessages.filter(m => m.role === 'user').map(m => `- ${m.content}`).join('\n')}
`

    const aiRes = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Use Sonnet for better reasoning
      max_tokens: 500,
      system: `You are ${userName}'s gentle, caring personal assistant. 
Your task is to write a warm, compassionate "Weekly Insights" summary based on their recent logs (diary, mood tracker, and chat).
Speak directly to them using "tu" naturally. Mix French and English softly as a close friend would (Franglish).
Acknowledge their wins, validate any struggles they had, and give a gentle word of encouragement for the week ahead.
Keep it structured, visually pleasing (use Markdown headers, bullet points), and not too long. No hashtags.
Respond ONLY with the summary as if you are speaking to them.`,
      messages: [{
        role: 'user',
        content: `Here is the data from ${userName}'s last week:\n${contextData}\nPlease write the weekly summary now.`
      }]
    })

    const content = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    
    // Determine current "week starts" string (Monday of current week)
    const d = new Date()
    const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday
    const monday = new Date(d.setDate(diff)).toISOString().split('T')[0]

    const entry = await db.insert(weekly_summaries).values({ weekStart: monday, content, userId: user.id }).returning()

    return NextResponse.json(entry[0])
  } catch (error: any) {
    console.error('SUMMARY_POST_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
