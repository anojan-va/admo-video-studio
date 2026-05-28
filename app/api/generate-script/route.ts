import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { brief } = await req.json()

  const durationSecs = brief.duration === '15s' ? 15 : brief.duration === '30s' ? 30 : 60
  const sceneCount = Math.round(durationSecs / 5)

  const prompt = `You are a professional video script writer for ADMO Video Studio, creating compelling campaigns about Abu Dhabi.

Campaign details:
- Brief: ${brief.brief}
- Theme: ${brief.theme}
- Platform: ${brief.platform}
- Duration: ${brief.duration} → ${sceneCount} scenes of approximately 5 seconds each

Write a voiceover script and scene-by-scene breakdown.

Respond ONLY with valid JSON in this exact format:
{
  "script": "The full voiceover script as a single piece of flowing prose",
  "scenes": [
    {
      "vo": "The voiceover text for this scene (a natural portion of the full script)",
      "prompt": "A detailed cinematic visual/cinematography prompt for generating this video scene"
    }
  ]
}

Requirements:
- Generate exactly ${sceneCount} scenes
- The voiceover across all scenes should form the complete script when read in sequence
- Make the tone aspirational and emotionally resonant, appropriate for ${brief.platform}
- Visual prompts should be cinematic, specific, and production-ready`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  return Response.json(JSON.parse(content))
}
