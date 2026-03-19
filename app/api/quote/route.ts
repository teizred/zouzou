import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { quotes } from '@/db/schema'
import { desc } from 'drizzle-orm'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  try {
    const recent = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(5)
    const recentTexts = recent.map(q => `- ${q.text}`).join('\n')

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Generate a short powerful quote of the day.
Motivational, deep, real. Like something you'd see tattooed or framed.
In English. Max 1 sentence. No author name, no hashtags, no emojis.
Do NOT repeat or rephrase any of these recent quotes:
${recentTexts}
Reply ONLY with the new quote, nothing else.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    await db.insert(quotes).values({ text, date: new Date().toISOString().split('T')[0] })
    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('QUOTE_API_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}