import { NextResponse } from 'next/server'

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer service role key (bypasses RLS); fall back to anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!base || !key) {
    console.error('[campaigns] Missing Supabase env vars')
    return NextResponse.json([], { status: 200 })
  }

  const url = `${base}/rest/v1/campaigns?select=*&order=completed_at.desc`

  try {
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    const body = await res.json()

    if (!res.ok) {
      console.error('[campaigns] Supabase error', res.status, JSON.stringify(body))
      return NextResponse.json([], { status: 200 })
    }

    const rows = Array.isArray(body) ? body : []
    console.log(`[campaigns] fetched ${rows.length} rows`)
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[campaigns] fetch failed', err)
    return NextResponse.json([], { status: 200 })
  }
}
