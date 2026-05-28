import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { scenes, brief, instruction } = await req.json()

  const scenesJson = JSON.stringify(scenes, null, 2)

  const prompt = `You are a professional video script editor for ADMO Video Studio.

The user has reviewed their generated campaign video and wants changes.

Current scenes:
${scenesJson}

Campaign context:
- Brief: ${brief.brief}
- Theme: ${brief.theme}
- Platform: ${brief.platform}
- Duration: ${brief.duration}

User instruction: "${instruction}"

Apply the user's instruction to the scenes. You may update the video prompt, the voiceover, or both — only change what is relevant to the instruction. Keep the same number of scenes.

Respond ONLY with valid JSON in this exact format:
{
  "scenes": [
    {
      "vo": "voiceover text for this scene",
      "prompt": "cinematic video generation prompt for this scene"
    }
  ]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  return Response.json(JSON.parse(content))
}
