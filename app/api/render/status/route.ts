import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaignId')

  if (!campaignId) {
    return Response.json({ error: 'Missing campaignId' }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!base || !key) return Response.json({ status: 'running' })

  const res = await fetch(
    `${base}/rest/v1/campaigns?id=eq.${encodeURIComponent(campaignId)}&select=id,final_url,status`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  )

  if (!res.ok) return Response.json({ status: 'running' })

  const rows = await res.json()
  const campaign = Array.isArray(rows) ? rows[0] : null

  if (!campaign) return Response.json({ status: 'running' })

  if (campaign.final_url) {
    return Response.json({ status: 'success', videoUrls: [campaign.final_url] })
  }

  if (campaign.status === 'error' || campaign.status === 'failed') {
    return Response.json({ status: 'error', error: 'Video generation failed' })
  }

  return Response.json({ status: 'running' })
}
