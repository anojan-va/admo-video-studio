export type Theme = 'Safety' | 'Livability' | 'Future'

export const samplePrompts: Record<Theme, string[]> = {
  Safety: [
    'A smiling Middle Eastern woman wearing a beige hijab and a brown leather jacket holds a toddler in a white winter hat. They stand together on the Abu Dhabi Corniche boardwalk at sunset, the modern city skyline glowing warm gold behind them. The atmosphere is tender, safe, and joyful.',
    'A young Emirati man in a crisp white kandura and ghutra stands in an Abu Dhabi urban park during the evening, speaking candidly with a relaxed and thoughtful expression. Warm streetlights glow softly behind him. The atmosphere is calm, safe, and reflective.',
    'A wide city avenue in Abu Dhabi at night, beautifully decorated with glowing light installations shaped like Arabic calligraphy and festive symbols draped across lampposts and bridges. Modern cars move along the asphalt, their surfaces reflecting vibrant yellow and green neon lights. The atmosphere is festive, safe, and celebratory.',
    'A group of diverse pedestrians cross a well-lit crosswalk on a busy Abu Dhabi street at night. Modern illuminated buildings line the background and a white SUV waits patiently at the traffic light. The atmosphere is safe, vibrant, and full of life.',
  ],

  Livability: [
    'A vibrant modern family walks along the Abu Dhabi Corniche promenade during golden hour, laughing and enjoying the cool sea breeze together. Behind them, the iconic Abu Dhabi skyline of glass skyscrapers glitters under the warm orange sun. The atmosphere is peaceful, luxurious, and family-friendly.',
    'A diverse group of friends and children play and ride electric scooters on the clean tree-lined streets of Masdar City on a bright sunny day. A happy child grins as they zoom past the innovative sustainable architecture. The atmosphere is energetic, joyful, and forward-thinking.',
    'A stylish couple relaxes on sunbeds beside a pristine infinity pool at a high-end Abu Dhabi beach resort, overlooking the clear blue Arabian Gulf. The faint city skyline shimmers in the distance while gentle waves splash softly in the background. The atmosphere is calm, sophisticated, and rejuvenating.',
  ],

  Future: [
    'A futuristic Abu Dhabi skyline where solar panels are woven elegantly into the facades of soaring skyscrapers. Lush vertical gardens cascade down building walls while autonomous electric pods glide silently on magnetic tracks along clean, car-free streets below. People move through the space with ease and confidence. The atmosphere is serene and optimistic.',
    'A young Emirati woman in a sleek black abaya and hijab interacts with a holographic smart city interface at the Al Maryah Island financial district. Futuristic digital displays and autonomous vehicles move seamlessly behind her in the ultra-modern streetscape. The sky transitions from amber and rose at dusk to cool blue city lights. The atmosphere is innovative, confident, and forward-thinking.',
    'A sleek white autonomous car moves through a bustling high-tech transit plaza in Abu Dhabi, where the street surface has integrated glowing LED pathways that pulse with data. Translucent glass structures in the background display holographic maps of city energy consumption while people move calmly, engaged with AR glasses. The atmosphere is intelligent, connected, and purposeful.',
    'A robotic arm delicately tends to genetically optimized plants inside a climate-controlled vertical farm bathed in soft magenta grow lights. Digital screens on the walls display real-time blockchain data tracking crop growth and distribution. The atmosphere is precise, sustainable, and quietly revolutionary.',
  ],
}

export function getSamplePromptsForTheme(theme: Theme): string[] {
  return samplePrompts[theme] ?? []
}
