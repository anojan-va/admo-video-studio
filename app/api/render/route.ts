import { NextRequest } from 'next/server'

interface Scene {
  vo: string
  prompt: string
}

interface Brief {
  brief: string
  theme: string
  platform: string
  duration: string
}

export async function POST(req: NextRequest) {
  const { brief, scenes }: { brief: Brief; scenes: Scene[] } = await req.json()

  const webhookPath = process.env.N8N_WEBHOOK_PATH ?? 'frameforge'
  const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/${webhookPath}`

  const campaignId = `campaign-${Date.now()}`
  const voiceoverScript = scenes.map(s => s.vo).filter(Boolean).join(' ') || brief.brief
  const audioDurationEstimate = parseInt(brief.duration) || 30
  const aspectRatio = brief.platform === 'YouTube' ? '16:9' : '9:16'

  const webhookPayload = JSON.stringify({
    campaignId,
    voiceoverScript,
    scenes: scenes.map((s, i) => ({ index: i, prompt: s.prompt, vo: s.vo })),
    audioDurationEstimate,
    theme: brief.theme,
    aspectRatio,
  })

  // Fire and forget — return immediately, let n8n run in the background
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: webhookPayload,
  }).catch(() => null)

  return Response.json({ campaignId })
}
