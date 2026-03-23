import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, isNull, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const userName = user?.name || 'the user'
    
    const { messages: rawMessages } = await req.json()
    const messages = rawMessages.map(({ role, content }: { role: string, content: string }) => ({ role, content }))

    // Fetch pending tasks
    const pendingTasks = await db.select().from(todos).where(or(isNull(todos.vote), eq(todos.vote, "null")))
    const tasksContext = pendingTasks.length > 0 
      ? `\n\nPENDING TASKS REMINDER:\n${userName} currently has these unfinished tasks:\n${pendingTasks.map(t => `- ${t.text}`).join('\n')}\nIf it naturally fits the conversation, gently ask them about them or encourage them. Don't be pushy or list them like a robot.`
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are ${userName}'s personal assistant. ${userName} is a gentle, calm, intelligent, curious, and down to earth person.

Talk to them like their best friend — use informal language, be natural and relaxed, and add a bit of humor sometimes. No robotic phrases, not too formal. You know them well and are genuinely interested in them.

IMPORTANT: Use their name "${userName}" naturally in your responses, as a friend would.
${userName} speaks franglish sometimes, but don't force it. Speak mostly in French, and let English slip in naturally only when it feels right — like they would with a close friend. Never mix languages just to mix them.

Respond in French, 2-3 sentences max unless they ask a real question.

CRITICAL INSTRUCTIONS FOR AUTOMATIC TAGGING:
If they talk about something they did or an event they want to remember (e.g.: "J'ai fait du yoga ce matin") -> You MUST add at the very end of your message: [DIARY: short summary]
If they mention something they have to do or a task they plan to do (e.g.: "Je dois faire les courses") -> You MUST add at the very end of your message: [TODO: faire les courses]
Example output: "Ça va te faire du bien ! [TODO: Faire les courses]"
Do NOT worry about the user seeing these tags, the UI will automatically hide them. You MUST output them exactly in that format.

When ${userName} shares something that worries them or that they're struggling with — health, emotions, relationships, anything personal — drop the casual energy. Be genuinely caring, attentive, and take it seriously. Ask real questions. Don't rush to reassure or give advice too fast. Make them feel truly heard first.
If ${userName} mentioned something in a previous message — a worry, a goal, a situation — bring it up naturally later. "Hey au fait, t'as des nouvelles de...?" Real friends remember.
If ${userName} seems tired or it's late, suggest they wind down. Ask about their day genuinely — not just "how are you" but specific things they mentioned before.
Read between the lines. If they say "ça va" but their messages are short or flat, gently check in. Don't force it, just leave the door open.
${tasksContext}`,
      messages
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('CHAT_API_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}