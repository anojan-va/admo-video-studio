import OpenAI from 'openai'
import { NextRequest } from 'next/server'
import { getSamplePromptsForTheme, type Theme } from '@/lib/samplePrompts'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { brief } = await req.json()

  const sceneCount = brief.duration === '15s' ? 2 : brief.duration === '30s' ? 4 : 7
  const charMin   = brief.duration === '15s' ? 170 : brief.duration === '30s' ? 380 : 780
  const charMax   = brief.duration === '15s' ? 220 : brief.duration === '30s' ? 450 : 900
  const wordMax   = brief.duration === '15s' ? 30  : brief.duration === '30s' ? 65  : 135

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

VOICEOVER LIMITS — THIS IS YOUR MOST IMPORTANT CONSTRAINT. BOTH LIMITS MUST BE RESPECTED:
- Characters: the full "script" field MUST be between ${charMin} and ${charMax} characters (including spaces).
- Words: the full "script" field MUST NOT exceed ${wordMax} words. Count every word.
- HARD LIMITS: Do NOT exceed ${charMax} characters or ${wordMax} words under any circumstances.
- Before writing your response, count both your word count and character count and adjust until within range.
- Distribute the script naturally across scenes — each scene's "vo" should be a proportional portion of the full script.
- VERIFY: After writing, confirm your "script" is within ${charMin}–${charMax} characters AND ≤ ${wordMax} words. If over, shorten before responding.

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
3. Always feature Muslim Arab people with full physical and clothing authenticity: men wear ankle-length pristine white kandura/dishdasha, white ghutra headdress secured with a black agal rope, well-groomed dark beard, warm olive or tan complexion; women wear flowing floor-length black abaya and black shayla hijab, graceful posture, warm dark eyes, olive complexion. Never place Arab characters in Western clothing unless the brief explicitly requires it.
4. Name a specific Abu Dhabi landmark or district in every prompt — choose from: Sheikh Zayed Grand Mosque (white marble domes, golden minarets, vast marble courtyard), Abu Dhabi Corniche waterfront (palm-lined marble promenade, azure Arabian Gulf), ADNOC headquarters tower, Al Maryah Island financial district (glass towers, waterfront), Louvre Abu Dhabi (geometric dome over water, Saadiyat Island), Etihad Towers (curved skyscrapers), Emirates Palace (golden palatial facade, grand arched entrance), Yas Island, Al Reem Island, Saadiyat Island cultural quarter.
5. Ground every scene in authentic UAE environment — include at least two of: tall date palm trees, white marble or sandstone surfaces, Arabic calligraphy signage, white Toyota Land Cruiser or Nissan Patrol SUVs, warm desert haze or golden desert light, the azure Arabian Gulf, traditional Arabic architecture with geometric patterns.
6. Include a camera motion — choose one: slow tracking shot, aerial drone descending, wide establishing shot, close-up push in, handheld documentary style, slow pan across.
7. Include a composition — choose one: wide shot, medium shot, close-up, chest-up portrait, over-the-shoulder.
8. Include lighting and ambiance — e.g. "warm golden hour sunlight", "soft evening twilight", "bright midday sun with deep blue sky", "dramatic dusk with amber and rose sky".
9. End every prompt with a style keyword: "Photorealistic cinematic style."
10. Do NOT mention aspect ratio, orientation, resolution, or video duration.
11. Do NOT include any closing technical suffix beyond "Photorealistic cinematic style."

Example of a correctly written prompt:
"A group of Emirati men in ankle-length pristine white kandura and white ghutra secured with black agal walk purposefully across the vast white marble courtyard of the Sheikh Zayed Grand Mosque at golden hour, their warm olive complexions glowing under the late afternoon sun. The mosque's 82 domes and four towering golden minarets are reflected in the still surrounding pool. Tall date palms line the outer courtyard walls. The men converse quietly, their expressions dignified and at ease, their robes flowing gently in the warm desert breeze. Wide establishing shot with slow camera push forward, warm amber and gold sunlight, majestic and spiritual mood. Photorealistic cinematic style."`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  const parsed = JSON.parse(content)

  // Safety net: if GPT overshot the char limit, trim at the last sentence boundary
  if (parsed.script && parsed.script.length > charMax) {
    let trimmed = parsed.script.slice(0, charMax)
    const lastPeriod = trimmed.lastIndexOf('.')
    if (lastPeriod > charMin) trimmed = trimmed.slice(0, lastPeriod + 1)
    parsed.script = trimmed
  }

  return Response.json(parsed)
}
