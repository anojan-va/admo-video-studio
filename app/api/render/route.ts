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

  const n8nHeaders = { 'X-N8N-API-KEY': process.env.N8N_API_KEY! }

  const webhookPayload = JSON.stringify({
    campaignId,
    voiceoverScript,
    scenes: scenes.map((s, i) => ({ index: i, prompt: s.prompt, vo: s.vo })),
    audioDurationEstimate,
    theme: brief.theme,
  })

  // Snapshot the latest execution ID before triggering so we can identify ours afterward.
  const beforeRes = await fetch(
    `${process.env.N8N_BASE_URL}/api/v1/executions?workflowId=${process.env.N8N_WORKFLOW_ID}&limit=1`,
    { headers: n8nHeaders },
  ).catch(() => null)

  const beforeId: number = beforeRes?.ok
    ? Number((await beforeRes.json()).data?.[0]?.id ?? 0)
    : 0

  // Fire the webhook. We abort after 9 s so this route doesn't block — the
  // workflow keeps running in n8n regardless of whether we stay connected.
  const ac = new AbortController()
  const timeoutId = setTimeout(() => ac.abort(), 9000)

  try {
    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: webhookPayload,
      signal: ac.signal,
    })
    clearTimeout(timeoutId)

    if (!webhookRes.ok) {
      return Response.json(
        { error: `n8n webhook returned HTTP ${webhookRes.status}` },
        { status: 502 },
      )
    }

    // n8n "Respond Immediately" mode returns { executionId } right away.
    const body = await webhookRes.json().catch(() => null)
    const fastId: string | null = body?.executionId ?? body?.id ?? null
    if (fastId) return Response.json({ executionId: fastId })

  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (!(err instanceof Error && err.name === 'AbortError')) {
      return Response.json(
        { error: `Could not reach n8n webhook: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 },
      )
    }
    // AbortError is expected — the workflow is long-running and still going in n8n.
  }

  // Poll the n8n executions API until a new execution appears.
  // n8n records executions as soon as they start, so this usually resolves in seconds.
  // 2-minute window covers slow Railway cold starts.
  const deadline = Date.now() + 120000
  let newExecId: string | null = null

  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const afterRes = await fetch(
      `${process.env.N8N_BASE_URL}/api/v1/executions?workflowId=${process.env.N8N_WORKFLOW_ID}&limit=5`,
      { headers: n8nHeaders },
    ).catch(() => null)

    if (!afterRes?.ok) continue

    const afterData = await afterRes.json()
    const executions: Array<{ id: string }> = afterData.data ?? []
    const found = executions.find(e => Number(e.id) > beforeId)
    if (found) {
      newExecId = found.id
      break
    }
  }

  if (!newExecId) {
    return Response.json(
      { error: 'Could not find the n8n execution after 2 minutes. In n8n, set the Webhook node → Respond → "Immediately" to fix this permanently.' },
      { status: 502 },
    )
  }

  return Response.json({ executionId: newExecId })
}
