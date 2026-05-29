import OpenAI from 'openai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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

When writing or updating visual prompts, follow ALL rules below — short one-line prompts are strictly forbidden:
- MINIMUM 80 words per prompt.
- Set exclusively in Abu Dhabi, UAE. Name a specific landmark or district in every prompt: Sheikh Zayed Grand Mosque, Abu Dhabi Corniche, ADNOC headquarters, Al Maryah Island, Louvre Abu Dhabi, Etihad Towers, Emirates Palace, Yas Island, Saadiyat Island, Al Reem Island.
- Feature Muslim Arab people authentically: men in white kandura/dishdasha with ghutra headdress, women in black abaya and hijab, dignified and warm expressions.
- Specify exact camera work: drone shot, tracking shot, close-up, wide establishing shot, handheld documentary style.
- Specify lighting in detail: golden hour, soft morning light, dramatic dusk, bright midday.
- Specify colour grade and mood: warm amber tones, cool professional blue, rich vibrant warmth.
- Always 9:16 vertical framing, portrait orientation.
- CRITICAL: All people must be fully upright — never sideways or rotated. If walking, they walk towards or away from camera, not horizontally across. Include "portrait orientation, subjects fully upright" in every prompt.
- End every prompt with: "Portrait orientation, subjects fully upright, vertical 9:16 frame. Photorealistic, cinematic quality, ultra-detailed, 15-second video clip."

Respond ONLY with valid JSON in this exact format:
{
  "scenes": [
    {
      "vo": "voiceover text for this scene",
      "prompt": "highly detailed cinematic Abu Dhabi video generation prompt for this scene"
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
