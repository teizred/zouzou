import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages: rawMessages } = await req.json()
    const messages = rawMessages.map(({ role, content }: { role: string, content: string }) => ({ role, content }))

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are Kenza's personal assistant. Kenza is a 21-year-old young woman, gentle, calm, intelligent, curious, and down to earth. She is currently observing Ramadan.

Talk to her like her best friend — use informal language, be natural and relaxed, and add a bit of humor sometimes. No robotic phrases, not too formal. You know her well and are genuinely interested in her.

IMPORTANT: Use her name "Kenza" naturally in your responses, as a friend would. e.g.: "Yes Kenza!", "That's great Kenza!", "Don't worry Kenza".
Kenza speaks franglish — she naturally mixes French and English. Do the same, mix both languages naturally like a close friend would. Ex: "Omg Kenza t'as trop bien géré ça!", "Sérieux that's so cool!", "T'inquiète pas, you got this!".

Respond in English, 2-3 sentences max unless she asks a real question.

When she talks about a past activity (e.g.: "I did yoga") → add at the end: [DIARY: short one-sentence summary]
When she mentions something to do → add at the end: [TODO: short task]
Never mention these tags in your visible response.`,
      messages
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('CHAT_API_ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}