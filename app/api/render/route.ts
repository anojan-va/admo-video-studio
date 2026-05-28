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

  const voiceoverScript = scenes.map(s => s.vo).filter(Boolean).join(' ') || brief.brief
  const audioDurationEstimate = parseInt(brief.duration) || 30
  const campaignId = `campaign-${Date.now()}`

  // Get the latest execution ID before triggering so we can identify our new execution
  const beforeRes = await fetch(
    `${process.env.N8N_BASE_URL}/api/v1/executions?workflowId=${process.env.N8N_WORKFLOW_ID}&limit=1`,
    { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY! } },
  ).catch(() => null)

  const beforeId: number = beforeRes?.ok
    ? Number((await beforeRes.json()).data?.[0]?.id ?? 0)
    : 0

  // Keep the connection open for 5 s so n8n can fully initialise the execution
  // (parse request, create DB record, set up response handler) before we close it.
  // n8n continues executing even after the connection drops — we poll for the result.
  const ac = new AbortController()
  const closeTimer = setTimeout(() => ac.abort(), 8000)
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignId,
      voiceoverScript,
      scenes: scenes.map((s, i) => ({ index: i, prompt: s.prompt, vo: s.vo })),
      audioDurationEstimate,
      theme: brief.theme,
    }),
    signal: ac.signal,
  }).catch(() => {}).finally(() => clearTimeout(closeTimer))

  // Wait 6 s (within the 8 s window) for n8n to register the new execution
  await new Promise(resolve => setTimeout(resolve, 6000))

  // Find the execution that was just created (ID higher than beforeId)
  const afterRes = await fetch(
    `${process.env.N8N_BASE_URL}/api/v1/executions?workflowId=${process.env.N8N_WORKFLOW_ID}&limit=5`,
    { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY! } },
  )

  if (!afterRes.ok) {
    return Response.json({ error: 'Could not verify workflow start' }, { status: 502 })
  }

  const afterData = await afterRes.json()
  const executions: Array<{ id: string }> = afterData.data ?? []
  const newExec = executions.find(e => Number(e.id) > beforeId) ?? executions[0]

  if (!newExec?.id) {
    return Response.json({ error: 'Workflow did not start — check n8n' }, { status: 502 })
  }

  return Response.json({ executionId: newExec.id })
}
