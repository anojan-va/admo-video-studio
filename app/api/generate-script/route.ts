import OpenAI from 'openai'
import { NextRequest } from 'next/server'
import { getSamplePromptsForTheme, type Theme } from '@/lib/samplePrompts'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { brief } = await req.json()

  const sceneCount = brief.duration === '15s' ? 2 : brief.duration === '30s' ? 3 : 6
  const charMin   = brief.duration === '15s' ? 230 : brief.duration === '30s' ? 420 : 850
  const charMax   = brief.duration === '15s' ? 260 : brief.duration === '30s' ? 450 : 900

  const themeSamples = getSamplePromptsForTheme(brief.theme as Theme)
  const samplesBlock = themeSamples
    .map((p, i) => `Sample ${i + 1}: "${p}"`)
    .join('\n\n')

  const prompt = `You are a professional video script writer for ADMO Video Studio, creating compelling campaigns set exclusively in Abu Dhabi, UAE.

Campaign details:
- Brief: ${brief.brief}
- Theme: ${brief.theme}
- Platform: ${brief.platform}
- Duration: ${brief.duration} → ${sceneCount} scene${sceneCount > 1 ? 's' : ''} of approximately 15 seconds each

VOICEOVER CHARACTER LIMIT — this is mandatory:
- The full voiceover script (the "script" field) MUST be between ${charMin} and ${charMax} characters total (including spaces).
- Count carefully. Do not go below ${charMin} or above ${charMax} characters.
- Distribute the script naturally across scenes — each scene's "vo" should be a proportional portion of the full script.

Write a voiceover script and scene-by-scene breakdown.

Respond ONLY with valid JSON in this exact format:
{
  "script": "The full voiceover script as a single piece of flowing prose",
  "scenes": [
    {
      "vo": "The voiceover text for this scene (a natural portion of the full script)",
      "prompt": "A highly detailed cinematic prompt for generating this 15-second video scene"
    }
  ]
}

REFERENCE SAMPLES — study these approved prompts for the "${brief.theme}" theme and match their style, depth, and structure:

${samplesBlock}

Requirements:
- Generate exactly ${sceneCount} scenes
- The voiceover across all scenes should form the complete script when read in sequence
- Make the tone aspirational and emotionally resonant, appropriate for ${brief.platform}

CRITICAL — Video prompt rules (every prompt MUST follow ALL of these):
1. MINIMUM 80 words per prompt. Short one-line prompts are strictly forbidden.
2. Set exclusively in Abu Dhabi, UAE — never generic or unspecified locations.
3. Always feature Muslim Arab people authentically: men wearing traditional white kandura/dishdasha with ghutra headdress, women in elegant black abaya and hijab, dignified and warm expressions, natural body language.
4. Name a specific Abu Dhabi landmark or district in every prompt — choose from: Sheikh Zayed Grand Mosque (white marble domes, golden minarets), Abu Dhabi Corniche waterfront (palm-lined promenade, azure Arabian Gulf), ADNOC headquarters tower, Al Maryah Island financial district, Louvre Abu Dhabi (geometric dome over water), Etihad Towers (curved skyscrapers), Emirates Palace (golden palatial facade), Yas Island, Al Reem Island, Saadiyat Island cultural quarter.
5. Describe ONLY what is happening in the scene — the story, the people, the place, and the atmosphere.
6. Do NOT mention camera angles, shot types, camera movement, lens choices, or framing.
7. Do NOT mention aspect ratio, orientation, resolution, or video duration.
8. Do NOT mention colour grade, colour palette, or post-processing style.
9. Do NOT include any technical suffix or closing tag.

Example of a correctly written prompt:
"A group of Emirati men in pristine white kandura and ghutra walk purposefully across the vast marble courtyard of the Sheikh Zayed Grand Mosque at golden hour. The mosque's 82 domes and four towering golden minarets glow warmly under the late afternoon sun, their reflections shimmering in the surrounding pool. The men converse quietly, their expressions dignified and at ease. Families and visitors from around the world move respectfully through the space. The atmosphere is majestic, spiritual, and deeply rooted in heritage."`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  return Response.json(JSON.parse(content))
}
