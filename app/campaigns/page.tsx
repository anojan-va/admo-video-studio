'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const BG     = '#F8F7F4'
const S1     = '#FFFFFF'
const RED    = '#B22234'
const T1     = '#1A1A1A'
const T2     = '#7A7672'
const BORDER = '#E8E4DE'

interface Campaign {
  id:           string
  final_url:    string
  audio_url:    string
  status:       string
  completed_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Video modal ──────────────────────────────────────────────────────────────
function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Pause & reset when closing
  const handleClose = () => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 }
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Stop click from propagating through the video itself */}
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          src={url}
          controls
          autoPlay
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 'auto',
            height: 'auto',
            borderRadius: 8,
            display: 'block',
          }}
        />
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: -14, right: -14,
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: T1, fontWeight: 700, lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── Campaign card ────────────────────────────────────────────────────────────
function CampaignCard({ c, onPreview }: { c: Campaign; onPreview: (url: string) => void }) {
  const [duration, setDuration] = useState<string | null>(null)

  return (
    <div
      style={{
        background: S1, border: `1px solid ${BORDER}`, borderRadius: 10,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      {/* Thumbnail + play button */}
      <div
        onClick={() => onPreview(c.final_url)}
        style={{
          position: 'relative', background: '#000', height: 200,
          overflow: 'hidden', cursor: 'pointer',
        }}
      >
        {/* Hidden video used only to grab the first frame + duration */}
        <video
          src={c.final_url}
          preload="metadata"
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onLoadedMetadata={e => {
            const secs = Math.round((e.currentTarget as HTMLVideoElement).duration)
            setDuration(secs + 's')
          }}
        />

        {/* Play overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.22)',
          transition: 'background 0.2s',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}>
            <span style={{ fontSize: 18, marginLeft: 4, color: T1 }}>▶</span>
          </div>
        </div>

        {duration && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 500,
            background: 'rgba(26,26,26,0.6)', color: '#fff',
          }}>
            {duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T1, wordBreak: 'break-all' }}>
          {c.id}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: 11, color: T2 }}>{formatDate(c.completed_at)}</span>
          <span style={{
            padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500,
            background: 'rgba(30,123,52,0.09)', color: '#1e7b34',
            border: '1px solid rgba(30,123,52,0.25)',
          }}>
            {c.status}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: S1,
        border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 24, opacity: 0.25 }}>▶</span>
      </div>
      <div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: T1, marginBottom: 6 }}>
          No campaigns yet
        </h2>
        <p style={{ fontSize: 13, color: T2, maxWidth: 300 }}>
          Start by creating your first video campaign to showcase Abu Dhabi.
        </p>
      </div>
      <button onClick={onNew} style={{
        marginTop: 8, padding: '10px 22px', borderRadius: 6, fontSize: 13, fontWeight: 500,
        background: RED, color: '#fff', border: 'none', cursor: 'pointer',
      }}>
        + Create first campaign
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns]   = useState<Campaign[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCampaigns(data)
        else setError('Failed to load campaigns')
      })
      .catch(() => setError('Failed to load campaigns'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      background: BG, minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: T1,
    }}>
      <header style={{
        height: 56, background: RED, borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.07em' }}>ADMO</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Video Studio</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => router.push('/')} style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid transparent', cursor: 'pointer',
          }}>
            Creation Canvas
          </button>
          <button style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer',
          }}>
            My Campaigns
          </button>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: '#2D2D2D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          M
        </div>
      </header>

      <main style={{ padding: '40px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T1, marginBottom: 6 }}>
            My Campaigns
          </h1>
          <p style={{ fontSize: 13, color: T2 }}>
            {loading ? 'Loading…' : error ? error : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} · sorted by latest`}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 24, height: 24, border: `2px solid ${BORDER}`, borderTopColor: RED,
              borderRadius: '50%', animation: 'spin 0.75s linear infinite',
            }} />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState onNew={() => router.push('/')} />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {campaigns.map(c => (
                <CampaignCard key={c.id} c={c} onPreview={setPreviewUrl} />
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => router.push('/')} style={{
                padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                background: RED, color: '#fff', border: 'none', cursor: 'pointer',
              }}>
                + New campaign
              </button>
            </div>
          </>
        )}
      </main>

      {previewUrl && <VideoModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
