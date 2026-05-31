'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const BG      = '#F8F7F4'
const S1      = '#FFFFFF'
const S2      = '#F2EFE9'
const PRIMARY = '#004D40'
const T1      = '#1A1A1A'
const T2      = '#7A7672'
const BORDER  = '#E8E4DE'
const BLIGHT  = 'rgba(232,228,222,0.7)'

interface DbCampaign {
  id: string
  final_url: string | null
  audio_url: string | null
  audio_duration: number | null
  status: string | null
  completed_at: string | null
}

type DisplayStatus = 'Exported' | 'In Review' | 'Draft'

function mapStatus(s: string | null): DisplayStatus {
  if (s === 'completed') return 'Exported'
  if (s === 'in_review') return 'In Review'
  return 'Draft'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function CampaignCard({ c, onClick }: { c: DbCampaign; onClick: () => void }) {
  const status = mapStatus(c.status)

  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER }}
      style={{
        background: S1, border: `1px solid ${BORDER}`, borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.3s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        height: 160, background: S2, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: `1px solid ${BLIGHT}`, overflow: 'hidden',
      }}>
        {c.final_url
          ? <video src={c.final_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="none" />
          : <span style={{ fontSize: 28, opacity: 0.18 }}>▶</span>
        }
      </div>

      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T1 }}>Video Campaign</div>
        <div style={{ fontSize: 11, color: T2, fontFamily: '"Roboto Mono", "Courier New", monospace' }}>
          {c.id}
        </div>
        {c.audio_duration != null && (
          <div style={{ fontSize: 11, color: T2 }}>~{Math.round(c.audio_duration)}s</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <span style={{ fontSize: 11, color: T2 }}>{formatDate(c.completed_at)}</span>
          <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: '#E5E5E5', color: '#2D2D2D' }}>
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<DbCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then((rows: unknown) => {
        setCampaigns(Array.isArray(rows) ? rows as DbCampaign[] : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: T1 }}>
      <header style={{
        height: 56, background: '#B22234', borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.07em' }}>ADMO</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>Video Studio</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid transparent', cursor: 'pointer' }}
          >
            Creation Canvas
          </button>
          <button style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            My Campaigns
          </button>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#FFFFFF' }}>
          M
        </div>
      </header>

      <main style={{ padding: '40px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T1, marginBottom: 6 }}>My Campaigns</h1>
          <p style={{ fontSize: 13, color: T2 }}>
            {loading ? 'Loading…' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} · sorted by latest`}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: T2, fontSize: 13, paddingTop: 80 }}>Loading campaigns…</div>
        ) : campaigns.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: S1, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, opacity: 0.25 }}>▶</span>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: T1, marginBottom: 6 }}>No campaigns yet</h2>
              <p style={{ fontSize: 13, color: T2, maxWidth: 300 }}>Start by creating your first video campaign to showcase Abu Dhabi.</p>
            </div>
            <button onClick={() => router.push('/')} style={{ marginTop: 8, padding: '10px 22px', borderRadius: 6, fontSize: 13, fontWeight: 500, background: '#C5A059', color: T1, border: 'none', cursor: 'pointer' }}>
              + Create first campaign
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {campaigns.map(c => (
                <CampaignCard key={c.id} c={c} onClick={() => router.push('/')} />
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => router.push('/')} style={{ padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500, background: '#B22234', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>
                + New campaign
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
