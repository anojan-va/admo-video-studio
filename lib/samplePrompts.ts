export type Theme = 'Safety' | 'Livability' | 'Future'

export const samplePrompts: Record<Theme, string[]> = {
  Safety: [
    'An Emirati mother in a flowing black abaya and black shayla hijab, warm olive complexion and gentle dark eyes, holds her toddler dressed in a crisp little white thobe on the Abu Dhabi Corniche promenade at sunset. Tall date palm trees line the marble walkway behind them, and the city skyline glows amber gold across the Arabian Gulf. The atmosphere is tender, protective, and deeply rooted in family.',
    'A young Emirati man in an ankle-length pristine white kandura, white ghutra secured with a black agal rope, well-groomed dark beard and warm tan complexion, stands in a landscaped Abu Dhabi public park during the evening. He speaks with ease and quiet confidence, surrounded by softly lit pathways, native desert shrubs, and gently swaying date palms. The atmosphere is calm, safe, and reflective.',
    'A grand boulevard in Abu Dhabi at night, lined with tall date palms wrapped in golden light and elaborate Arabic calligraphy light installations draped across lampposts and pedestrian bridges. White Toyota Land Cruisers and sleek modern cars glide along the wide asphalt boulevard, their polished surfaces catching the warm amber glow of the festive decorations and Arabic signage. The atmosphere is celebratory, safe, and unmistakably Emirati.',
    'A group of Emirati men in white kandura and ghutra with black agal, alongside women in black abayas and children in traditional dress, cross a wide illuminated pedestrian crossing near the Emirates Palace on a warm Abu Dhabi evening. Arabic signage glows on modern storefronts and date palms frame the grand boulevard. The atmosphere is safe, vibrant, and full of authentic Emirati life.',
  ],

  Livability: [
    'An Emirati family strolls along the Abu Dhabi Corniche promenade during golden hour — the father in a crisp white kandura and ghutra with black agal, the mother in a flowing black abaya and shayla hijab, their children running ahead laughing with joy. Tall date palms cast long shadows across the marble walkway and the azure Arabian Gulf stretches to the horizon beneath a warm amber sky. The atmosphere is peaceful, luxurious, and deeply family-oriented.',
    'Young Emirati professionals in white kandura and Emirati women in elegant black abayas ride electric scooters and walk together through the clean shaded streets of Masdar City on a bright sunny day. Children with warm olive skin and dark eyes play freely around the innovative sustainable architecture. Date palms and native desert plants line the wide pedestrian pathways. The atmosphere is energetic, joyful, and proudly forward-thinking.',
    'An Emirati couple — the man in a relaxed white kandura, the woman in a flowing black abaya — recline comfortably on sunbeds beside a pristine infinity pool at a luxury beach resort on Saadiyat Island, overlooking the crystal-clear Arabian Gulf. Date palms sway gently nearby and the Abu Dhabi skyline shimmers faintly in the warm afternoon haze across the water. The atmosphere is calm, sophisticated, and rejuvenating.',
  ],

  Future: [
    'An Emirati man in a white kandura and ghutra with black agal walks confidently along a clean car-free boulevard in a futuristic Abu Dhabi district where solar panels are woven elegantly into the facades of soaring sandstone-and-glass skyscrapers. Lush vertical gardens cascade down building walls beside him and autonomous electric pods glide silently on magnetic tracks along the pathway. Arabic holographic signage floats above the street. The atmosphere is serene, optimistic, and unmistakably Emirati.',
    'A young Emirati woman in a flowing floor-length black abaya and black shayla hijab, warm olive complexion and focused dark eyes, interacts with a holographic smart city interface displaying Arabic and English data at the Al Maryah Island financial district. Futuristic digital displays and autonomous vehicles move seamlessly behind her in the ultra-modern glass-and-steel streetscape. The sky deepens from amber and rose at dusk into cool blue city lights. The atmosphere is innovative, confident, and forward-thinking.',
    'Emirati men in white kandura and ghutra with black agal walk purposefully through a bustling high-tech transit plaza in Abu Dhabi, where the marble-and-glass plaza surface has integrated glowing LED pathways pulsing with data beneath their feet. Tall date palms line the perimeter and translucent glass towers display holographic energy maps in Arabic script. Other professionals in traditional Gulf dress move calmly through the space. The atmosphere is intelligent, connected, and proudly Emirati.',
    'A young Emirati woman in a white lab coat worn over her flowing black abaya carefully tends to rows of genetically optimized plants inside a vast climate-controlled vertical farm bathed in soft magenta grow lights. Her warm olive complexion and focused dark eyes reflect the glow of surrounding screens. Digital displays on the walls show real-time crop and water data in Arabic script, tracking sustainable agriculture across the UAE. The atmosphere is precise, innovative, and quietly revolutionary.',
  ],
}

export function getSamplePromptsForTheme(theme: Theme): string[] {
  return samplePrompts[theme] ?? []
}
