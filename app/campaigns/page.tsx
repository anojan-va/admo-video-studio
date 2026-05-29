'use client'

import { useRouter } from 'next/navigation'

// ─── Design tokens (duplicated to keep the file self-contained) ──────────────
const BG      = '#F8F7F4'
const S1      = '#FFFFFF'
const S2      = '#F2EFE9'
const PRIMARY = '#004D40'
const GOLD    = '#C5A059'
const T1      = '#1A1A1A'
const T2      = '#7A7672'
const BORDER  = '#E8E4DE'
const BLIGHT  = 'rgba(232,228,222,0.7)'

// ─── Types ───────────────────────────────────────────────────────────────────
type CampaignStatus = 'Exported' | 'In Review' | 'Draft'

interface Campaign {
  id:       string
  title:    string
  platform: string
  date:     string
  status:   CampaignStatus
  theme:    string
  duration: string
  scenes:   number
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  {
    id:       '1',
    title:    'Abu Dhabi Safety Campaign',
    platform: 'Instagram',
    date:     '27 May 2026',
    status:   'Exported',
    theme:    'Safety',
    duration: '30s',
    scenes:   3,
  },
  {
    id:       '2',
    title:    'Livability — Family Life in AD',
    platform: 'TikTok',
    date:     '20 May 2026',
    status:   'In Review',
    theme:    'Livability',
    duration: '15s',
    scenes:   3,
  },
  {
    id:       '3',
    title:    'Future City 2030',
    platform: 'LinkedIn',
    date:     '15 May 2026',
    status:   'Draft',
    theme:    'Future',
    duration: '60s',
    scenes:   3,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusStyle(_s: CampaignStatus): { bg: string; color: string; border: string } {
  return { bg: '#E5E5E5', color: '#2D2D2D', border: 'none' }
}

const ar = (p: string) => (p === 'Instagram' || p === 'TikTok') ? '9:16' : '16:9'

// ─── Campaign card ────────────────────────────────────────────────────────────
function CampaignCard({ c, onClick }: { c: Campaign; onClick: () => void }) {
  const sv = statusStyle(c.status)

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
      {/* Thumbnail */}
      <div style={{
        height: 160, background: S2, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: `1px solid ${BLIGHT}`,
      }}>
        <span style={{ fontSize: 28, opacity: 0.18 }}>▶</span>

        {/* Theme pill */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500,
          background: '#C8923A', color: '#FFFFFF', border: 'none',
        }}>
          {c.theme}
        </div>

        {/* Aspect ratio */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 500,
          background: 'rgba(26,26,26,0.06)', color: T2,
        }}>
          {ar(c.platform)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T1, lineHeight: 1.4 }}>{c.title}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: T2 }}>{c.platform}</span>
          <span style={{ color: BORDER }}>·</span>
          <span style={{ fontSize: 11, color: T2 }}>{c.duration}</span>
          <span style={{ color: BORDER }}>·</span>
          <span style={{ fontSize: 11, color: T2 }}>{c.scenes} scenes</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: 11, color: T2 }}>{c.date}</span>
          <span style={{
            padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500,
            background: sv.bg, color: sv.color, border: `1px solid ${sv.border}`,
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
        border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center',
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
        background: GOLD, color: T1, border: 'none', cursor: 'pointer', transition: 'opacity 0.3s',
      }}>
        + Create first campaign
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const router = useRouter()

  return (
    <div style={{
      background: BG, minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: T1,
    }}>
      {/* Nav */}
      <header style={{
        height: 56, background: '#B22234', borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.07em' }}>
            ADMO
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>Video Studio</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: 'transparent', color: 'rgba(255,255,255,0.75)', border: '1px solid transparent',
              cursor: 'pointer', transition: 'color 0.3s',
            }}
          >
            Creation Canvas
          </button>
          <button style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer',
          }}>
            My Campaigns
          </button>
        </div>

        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: PRIMARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 500, color: '#FFFFFF',
        }}>
          M
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: '40px 48px', maxWidth: 1280, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T1, marginBottom: 6 }}>
            My Campaigns
          </h1>
          <p style={{ fontSize: 13, color: T2 }}>
            {CAMPAIGNS.length} campaign{CAMPAIGNS.length !== 1 ? 's' : ''} · sorted by latest
          </p>
        </div>

        {CAMPAIGNS.length === 0 ? (
          <EmptyState onNew={() => router.push('/')} />
        ) : (
          <>
            {/* Responsive grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {CAMPAIGNS.map(c => (
                <CampaignCard
                  key={c.id}
                  c={c}
                  onClick={() => router.push('/?stage=6')}
                />
              ))}
            </div>

            {/* New campaign CTA */}
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: '#B22234', color: '#FFFFFF', border: 'none', cursor: 'pointer',
                  transition: 'opacity 0.3s',
                }}
              >
                + New campaign
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
