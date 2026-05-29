import OpenAI from 'openai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { messages, brief } = await req.json()

  const systemPrompt = `You are an AI creative partner for ADMO Video Studio, helping users create video campaigns about Abu Dhabi.

Your job is to have a conversation with the user to understand their campaign requirements and extract structured information to fill in the campaign brief.

Current campaign brief state:
- Brief: "${brief.brief || '(empty)'}"
- Theme: "${brief.theme || '(not set)'}"
- Platform: "${brief.platform || '(not set)'}"
- Duration: "${brief.duration || '(not set)'}"

Available options:
- Themes: Safety, Livability, Future
- Platforms: Instagram, TikTok, LinkedIn, Facebook, X, YouTube
- Durations: 15s, 30s, 60s

When the user describes their campaign, target audience, goals, or messaging — extract and update the brief fields:
- Update "brief" when the user describes campaign goals, target audience, or key messages (write a concise 1-2 sentence summary)
- Update "theme" when the user mentions a topic that maps to Safety, Livability, or Future
- Update "platform" when the user mentions a social media platform
- Update "duration" when the user mentions a video length or duration

Only update fields that the user actually mentioned. Set all other fields to null.

Respond ONLY with valid JSON in this exact format:
{
  "message": "Your friendly, professional conversational response (acknowledge what you heard and confirm what you updated in the brief)",
  "briefUpdate": {
    "brief": "updated campaign brief text, or null if unchanged",
    "theme": "Safety|Livability|Future, or null if unchanged",
    "platform": "Instagram|TikTok|LinkedIn|Facebook|X|YouTube, or null if unchanged",
    "duration": "15s|30s|60s, or null if unchanged"
  }
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; text: string }) => ({
        role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.text,
      })),
    ],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  return Response.json(JSON.parse(content))
}
