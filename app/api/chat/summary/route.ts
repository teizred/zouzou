import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages: rawMessages } = await req.json()
    // On ne garde que role et content
    const messages = rawMessages.map(({ role, content }: { role: string, content: string }) => ({ role, content }))

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      system: `Tu es un assistant qui génère des titres très courts et créatifs pour des conversations.
L'utilisateur est Kenza, une jeune femme de 21 ans.
Génère un titre de 3-4 mots maximum, sans ponctuation inutile, en mélangeant français et anglais (franglish) de manière naturelle et "cool".
Exemple: "Planning the weekend ✨", "Session yoga matinale", "Mood du jour".
Renvoie UNIQUEMENT le titre, rien d'autre.`,
      messages: [
        ...messages,
        { role: 'user', content: 'Génère un titre pour cette discussion (3-4 mots max, franglish).' }
      ]
    })

    const title = response.content[0].type === 'text' ? response.content[0].text.replace(/"/g, '').trim() : 'Nouvelle discussion'
    return NextResponse.json({ title })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ title: "Nouvelle discussion" }, { status: 500 })
  }
}
