import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    'https://vxtzghuctfihbgwwyrwx.supabase.co/rest/v1/campaigns?select=*&order=completed_at.desc',
    {
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dHpnaHVjdGZpaGJnd3d5cnd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk4NzM5MywiZXhwIjoyMDk1NTYzMzkzfQ.Ux2Cm0NKKv9glGBOQxsBm2s08RnwznI81kgzIXK9csg',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dHpnaHVjdGZpaGJnd3d5cnd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk4NzM5MywiZXhwIjoyMDk1NTYzMzkzfQ.Ux2Cm0NKKv9glGBOQxsBm2s08RnwznI81kgzIXK9csg',
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
