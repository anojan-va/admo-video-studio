import OpenAI from 'openai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { brief } = await req.json()

  const sceneCount = brief.duration === '15s' ? 2 : brief.duration === '30s' ? 3 : 6
  const charMin   = brief.duration === '15s' ? 230 : brief.duration === '30s' ? 420 : 850
  const charMax   = brief.duration === '15s' ? 260 : brief.duration === '30s' ? 450 : 900

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

Requirements:
- Generate exactly ${sceneCount} scenes
- The voiceover across all scenes should form the complete script when read in sequence
- Make the tone aspirational and emotionally resonant, appropriate for ${brief.platform}

CRITICAL — Video prompt rules (every prompt MUST follow ALL of these):
1. MINIMUM 80 words per prompt. Short one-line prompts are strictly forbidden.
2. Set exclusively in Abu Dhabi, UAE — never generic or unspecified locations.
3. Always feature Muslim Arab people authentically: men wearing traditional white kandura/dishdasha with ghutra headdress, women in elegant black abaya and hijab, dignified and warm expressions, natural body language.
4. Name a specific Abu Dhabi landmark or district in every prompt — choose from: Sheikh Zayed Grand Mosque (white marble domes, golden minarets), Abu Dhabi Corniche waterfront (palm-lined promenade, azure Arabian Gulf), ADNOC headquarters tower, Al Maryah Island financial district, Louvre Abu Dhabi (geometric dome over water), Etihad Towers (curved skyscrapers), Emirates Palace (golden palatial facade), Yas Island, Al Reem Island, Saadiyat Island cultural quarter.
5. Specify exact camera work: e.g. "slow aerial drone descending", "close-up tracking shot at eye level", "wide establishing shot with shallow depth of field", "handheld intimate documentary style".
6. Specify lighting in detail: e.g. "warm golden hour sunlight casting long shadows", "soft diffused morning light", "dramatic dusk with amber and rose sky", "bright midday sun with deep blue sky".
7. Specify colour grade and mood: e.g. "warm amber and gold tones, hopeful and aspirational", "cool blue tones, professional and trustworthy", "rich warm tones, culturally vibrant".
8. VERTICAL ORIENTATION — this is critical to prevent sideways subjects:
   • All people must be fully upright, standing or walking naturally — never sideways or rotated
   • Camera is held in portrait/vertical position (like a phone camera)
   • If people are walking, they walk towards the camera or away from it, or across frame while staying fully upright
   • Never describe movement that would cause people to appear horizontal
   • Include the words "portrait orientation, subjects fully upright" in every prompt
9. 9:16 vertical framing for ${brief.platform}.
10. End every prompt with: "Portrait orientation, subjects fully upright, vertical 9:16 frame. Photorealistic, cinematic quality, ultra-detailed, 15-second video clip."

Example of a correctly detailed prompt:
"Slow aerial drone shot descending towards the Sheikh Zayed Grand Mosque in Abu Dhabi at golden hour. The vast white marble courtyard gleams under warm amber sunlight, with the mosque's 82 domes and four towering golden minarets reflected in the surrounding pool. A group of Emirati men in pristine white kandura and ghutra walk purposefully towards the camera across the courtyard, their robes flowing gently in the breeze, subjects fully upright and natural. The camera tilts down to reveal the intricate floral mosaic floor patterns. Warm gold and ivory colour palette, majestic and spiritual mood. Portrait orientation, subjects fully upright, vertical 9:16 frame. Photorealistic, cinematic quality, ultra-detailed, 15-second video clip."`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content ?? '{}'
  return Response.json(JSON.parse(content))
}
