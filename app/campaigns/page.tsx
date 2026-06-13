'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdmoLogo } from '../components/AdmoLogo'

const BG      = '#1A1A2E'
const S1      = '#16213E'
const S2      = '#0F1B30'
const CYAN    = '#00D4FF'
const T1      = '#FFFFFF'
const T2      = '#8892A4'
const BORDER  = 'rgba(255,255,255,0.08)'
const BLIGHT  = 'rgba(255,255,255,0.05)'

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
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = CYAN }}
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
        {c.final_url ? (
          <>
            <video
              src={c.final_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              preload="metadata"
            />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(0,212,255,0.2)',
                border: `1px solid ${CYAN}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, marginLeft: 3, color: CYAN }}>▶</span>
              </div>
            </div>
          </>
        ) : (
          <span style={{ fontSize: 28, opacity: 0.18, color: T2 }}>▶</span>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: T1 }}>Video Campaign</div>
        <div style={{ fontSize: 11, color: '#4A5568', fontFamily: '"Roboto Mono", "Courier New", monospace' }}>
          {c.id}
        </div>
        {c.audio_duration != null && (
          <div style={{ fontSize: 11, color: T2 }}>~{Math.round(c.audio_duration)}s</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <span style={{ fontSize: 13, color: T2 }}>{formatDate(c.completed_at)}</span>
          <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: 'rgba(0,212,255,0.1)', color: CYAN, border: `1px solid rgba(0,212,255,0.25)` }}>
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
  // detail navigation handled by router

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
    <div style={{ background: BG, height: '100%', overflowY: 'auto', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: T1 }}>
      <header style={{
        height: 56, background: '#0A0A0A', borderBottom: `3px solid #F5A623`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <AdmoLogo />
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: 'transparent', color: T2, border: '1px solid transparent', cursor: 'pointer' }}
          >
            Creation Canvas
          </button>
          <button style={{ padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: 'transparent', color: '#F5A623', border: `1px solid #F5A623`, cursor: 'pointer' }}>
            My Campaigns
          </button>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2D3748', border: '1px solid #F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#FFFFFF' }}>
          M
        </div>
      </header>

      <main style={{ padding: '40px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: T1, marginBottom: 6, letterSpacing: '-0.02em' }}>My Campaigns</h1>
          <p style={{ fontSize: 13, color: T2 }}>
            {loading ? 'Loading…' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} · sorted by latest`}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: T2, fontSize: 13, paddingTop: 80 }}>Loading campaigns…</div>
        ) : campaigns.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: S1, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, opacity: 0.25, color: T2 }}>▶</span>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: T1, marginBottom: 6, letterSpacing: '-0.02em' }}>No campaigns yet</h2>
              <p style={{ fontSize: 13, color: T2, maxWidth: 300 }}>Start by creating your first video campaign to showcase Abu Dhabi.</p>
            </div>
            <button onClick={() => router.push('/')} style={{ marginTop: 8, padding: '10px 22px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: 'transparent', color: CYAN, border: `2px solid ${CYAN}`, cursor: 'pointer' }}>
              + Create first campaign
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {campaigns.map(c => (
                <CampaignCard key={c.id} c={c} onClick={() => c.final_url && window.open(c.final_url, '_blank')} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
