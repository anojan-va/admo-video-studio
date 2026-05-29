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

  // Get the latest execution ID before triggering so we can identify our new execution
  const beforeRes = await fetch(
    `${process.env.N8N_BASE_URL}/api/v1/executions?workflowId=${process.env.N8N_WORKFLOW_ID}&limit=1`,
    { headers: n8nHeaders },
  ).catch(() => null)

  const beforeId: number = beforeRes?.ok
    ? Number((await beforeRes.json()).data?.[0]?.id ?? 0)
    : 0

  // Trigger the webhook. Since responseMode is "responseNode" the connection stays
  // open until the workflow's Respond node fires (potentially minutes). We race it
  // against a 9-second timeout so this route can return before the workflow finishes.
  const webhookPayload = JSON.stringify({
    campaignId,
    voiceoverScript,
    scenes: scenes.map((s, i) => ({ index: i, prompt: s.prompt, vo: s.vo })),
    audioDurationEstimate,
    theme: brief.theme,
  })

  const ac = new AbortController()
  const timeoutId = setTimeout(() => ac.abort(), 9000)

  let webhookOk = false
  let webhookStatus = 0
  try {
    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: webhookPayload,
      signal: ac.signal,
    })
    webhookOk = webhookRes.ok || webhookRes.status === 200
    webhookStatus = webhookRes.status
    clearTimeout(timeoutId)
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    if (!isAbort) {
      // Real network error (not an intentional timeout abort)
      return Response.json(
        { error: `Could not reach n8n webhook: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 },
      )
    }
    // AbortError means the workflow is long-running — it's still running in n8n,
    // we just stopped waiting for the HTTP response. This is expected for video generation.
    webhookOk = true
  }

  if (!webhookOk) {
    return Response.json(
      { error: `n8n webhook returned HTTP ${webhookStatus}` },
      { status: 502 },
    )
  }

  // Wait up to 8 s for n8n to register the new execution in its database
  const deadline = Date.now() + 8000
  let newExecId: string | null = null

  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 1500))

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
    return Response.json({ error: 'Workflow did not start — check n8n' }, { status: 502 })
  }

  return Response.json({ executionId: newExecId })
}
