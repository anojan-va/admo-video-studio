'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdmoLogo } from '../../components/AdmoLogo'

const BG     = '#1A1A2E'
const S1     = '#16213E'
const S2     = '#0F1B30'
const CYAN   = '#00D4FF'
const T1     = '#FFFFFF'
const T2     = '#8892A4'
const BORDER = 'rgba(255,255,255,0.08)'
const ERR    = '#FF6B6B'

interface DbCampaign {
  id: string
  final_url: string | null
  audio_url: string | null
  audio_duration: number | null
  status: string | null
  completed_at: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [campaign, setCampaign] = useState<DbCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [dlState, setDlState] = useState<'idle' | 'downloading' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch('/api/campaigns')
      .then(r => r.json())
      .then((rows: unknown) => {
        if (Array.isArray(rows)) {
          const found = (rows as DbCampaign[]).find(c => c.id === id)
          setCampaign(found ?? null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const download = async () => {
    if (!campaign?.final_url) return
    setDlState('downloading')
    try {
      const res = await fetch(campaign.final_url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${id}.mp4`
      a.click()
      URL.revokeObjectURL(url)
      setTimeout(() => setDlState('idle'), 2500)
    } catch {
      setDlState('error')
    }
  }

  const copyLink = () => {
    if (!campaign?.final_url) return
    navigator.clipboard.writeText(campaign.final_url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <button
            onClick={() => router.push('/campaigns')}
            style={{ padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: 'transparent', color: '#F5A623', border: `1px solid #F5A623`, cursor: 'pointer' }}
          >
            My Campaigns
          </button>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2D3748', border: '1px solid #F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFFFFF' }}>
          M
        </div>
      </header>

      <main style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <button
          onClick={() => router.push('/campaigns')}
          style={{ background: 'none', border: 'none', color: T2, fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back to campaigns
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', color: T2, fontSize: 13, paddingTop: 80 }}>Loading…</div>
        ) : !campaign ? (
          <div style={{ textAlign: 'center', color: T2, fontSize: 13, paddingTop: 80 }}>Campaign not found.</div>
        ) : (
          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>

            {/* Video player */}
            <div style={{
              flexShrink: 0, width: 320,
              background: '#000', borderRadius: 12, overflow: 'hidden',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              {campaign.final_url ? (
                <video
                  src={campaign.final_url}
                  controls
                  autoPlay={false}
                  style={{ width: '100%', display: 'block' }}
                />
              ) : (
                <div style={{
                  aspectRatio: '9/16', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: S2,
                }}>
                  <span style={{ fontSize: 11, color: T2 }}>No video available</span>
                </div>
              )}
            </div>

            {/* Details panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: T1, marginBottom: 4, letterSpacing: '-0.02em' }}>
                  Video Campaign
                </h1>
                <div style={{ fontSize: 11, color: '#4A5568', fontFamily: '"Roboto Mono", monospace' }}>{campaign.id}</div>
              </div>

              {/* Meta */}
              <div style={{ background: S1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Status',     value: campaign.status === 'completed' ? 'Exported' : campaign.status ?? '—' },
                  { label: 'Duration',   value: campaign.audio_duration != null ? `~${Math.round(campaign.audio_duration)}s` : '—' },
                  { label: 'Completed',  value: formatDate(campaign.completed_at) },
                  { label: 'Format',     value: 'MP4' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: T2 }}>{label}</span>
                    <span style={{ color: T1, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Video URL */}
              {campaign.final_url && (
                <div style={{ background: S1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: T2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Video Link</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      flex: 1, background: S2, border: `1px solid ${BORDER}`, borderRadius: 6,
                      padding: '8px 12px', fontSize: 11, color: T2,
                      fontFamily: '"Roboto Mono", monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {campaign.final_url}
                    </div>
                    <button onClick={copyLink} style={{
                      padding: '8px 14px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: CYAN, color: '#0A0A0A', border: 'none',
                      fontSize: 14, fontWeight: 600, letterSpacing: '0.01em',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Download */}
              <button
                onClick={download}
                disabled={!campaign.final_url || dlState === 'downloading'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, letterSpacing: '0.01em',
                  background: (!campaign.final_url || dlState === 'downloading') ? S2 : CYAN,
                  color: (!campaign.final_url || dlState === 'downloading') ? T2 : '#0A0A0A',
                  border: 'none', cursor: (!campaign.final_url || dlState === 'downloading') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {dlState === 'downloading' ? 'Downloading…' : 'Download MP4'}
              </button>
              {dlState === 'error' && (
                <div style={{ fontSize: 11, color: ERR }}>Download failed. Please try again.</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
