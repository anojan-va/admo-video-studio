import { NextRequest } from 'next/server'

// Recursively search an object tree for URL strings ending in video extensions
// or fields named videoUrl / url / video_url / fileUrl / outputUrl
function extractVideoUrls(obj: unknown, depth = 0): string[] {
  if (depth > 8 || obj === null || obj === undefined) return []

  if (typeof obj === 'string') {
    const isVideoUrl =
      /^https?:\/\/.+\.(mp4|webm|mov|avi)(\?.*)?$/i.test(obj) ||
      /^https?:\/\/.+\/video\//i.test(obj)
    return isVideoUrl ? [obj] : []
  }

  if (Array.isArray(obj)) {
    return obj.flatMap(item => extractVideoUrls(item, depth + 1))
  }

  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>
    const directKeys = ['videoUrl', 'video_url', 'url', 'fileUrl', 'outputUrl', 'output_url', 'result']
    const direct = directKeys
      .filter(k => typeof record[k] === 'string')
      .map(k => record[k] as string)
      .filter(v => v.startsWith('http'))

    const nested = Object.values(record).flatMap(v => extractVideoUrls(v, depth + 1))
    return [...direct, ...nested]
  }

  return []
}

export async function GET(req: NextRequest) {
  const executionId = req.nextUrl.searchParams.get('executionId')

  if (!executionId) {
    return Response.json({ error: 'Missing executionId' }, { status: 400 })
  }

  const res = await fetch(
    `${process.env.N8N_BASE_URL}/api/v1/executions/${executionId}?includeData=true`,
    { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY! } },
  )

  if (!res.ok) {
    return Response.json({ status: 'error', error: `n8n ${res.status}` }, { status: 502 })
  }

  // n8n returns the execution object directly (not wrapped in { data: ... })
  // execution.data holds the internal runData — do NOT use data.data as the execution
  const execution = await res.json()

  const n8nStatus: string = execution.status ?? 'unknown'
  const finished: boolean = execution.finished === true

  const isSuccess = n8nStatus === 'success' || (finished && n8nStatus === 'unknown')
  const isFailed  = n8nStatus === 'error' || n8nStatus === 'crashed'

  if (isSuccess) {
    const runData = execution.data?.resultData?.runData ?? {}
    const allOutputs = Object.values(runData).flat()
    const videoUrls = [...new Set(extractVideoUrls(allOutputs))]
    return Response.json({ status: 'success', videoUrls })
  }

  if (isFailed) {
    const errorMsg = execution.data?.resultData?.error?.message ?? 'Workflow failed'
    return Response.json({ status: 'error', error: errorMsg })
  }

  // running / waiting / new
  return Response.json({ status: 'running' })
}
