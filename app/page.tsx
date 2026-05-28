'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const BG     = '#F8F7F4'
const S1     = '#FFFFFF'
const S2     = '#F2EFE9'
const RED    = '#B22234'
const GREEN  = '#1E7B34'
const T1     = '#1A1A1A'
const T2     = '#5F5E5A'
const BORDER = '#E8E4DE'
const BLIGHT = 'rgba(232,228,222,0.7)'

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
// Stage 3 (Scenes) removed — stages are now: Brief · Script · Rendering · Approve · Export
type Stage   = 1|2|3|4|5
type MsgRole = 'ai'|'user'

interface Msg   { role: MsgRole; text: string }
interface Brief { brief: string; theme: string; platform: string; duration: string }
interface Scene { vo: string; prompt: string }

const THEMES    = ['Safety', 'Livability', 'Future'] as const
const PLATFORMS = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'X', 'YouTube'] as const
const DURATIONS = ['15s', '30s', '60s'] as const
const STAGE_LBL = ['Brief', 'Script', 'Rendering', 'Approve', 'Export'] as const

const ar = (p: string) => (p === 'Instagram' || p === 'TikTok') ? '9:16' : p ? '16:9' : '—'

// ─────────────────────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────────────────────
const INIT_BRIEF: Brief = { brief: '', theme: '', platform: '', duration: '' }

const INIT_CHAT: Msg[] = [
  {
    role: 'ai',
    text: "Welcome to ADMO Video Studio. I'm your creative AI partner — here to help you craft compelling videos about Abu Dhabi. Tell me about your campaign and I'll fill in the brief for you.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: T2, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function SelectPill({ children, on, onClick }: { children: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 15px', borderRadius: 20, fontSize: 12, fontWeight: 400,
      background: on ? T1 : S1,
      color:      on ? '#FFFFFF' : T2,
      border:     on ? `1px solid ${T1}` : `1px solid ${BORDER}`,
      cursor: 'pointer', transition: 'all 0.3s',
    }}>
      {children}
    </button>
  )
}

type BtnVariant = 'primary'|'ghost'|'success'

function ActionBtn({
  children, onClick, variant = 'primary', disabled = false, fullWidth = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: BtnVariant
  disabled?: boolean
  fullWidth?: boolean
}) {
  const vs = disabled
    ? { bg: S2, color: T2 + '88', border: `1px solid ${BORDER}` }
    : variant === 'primary' ? { bg: RED,   color: '#FFFFFF', border: 'none' }
    : variant === 'success' ? { bg: 'rgba(30,123,52,0.10)', color: GREEN, border: `1px solid rgba(30,123,52,0.30)` }
    :                          { bg: S1,   color: T2,        border: `1px solid ${BORDER}` }

  return (
    <button onClick={!disabled ? onClick : undefined} style={{
      padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      background: vs.bg, color: vs.color, border: vs.border,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s', whiteSpace: 'nowrap',
      width: fullWidth ? '100%' : undefined,
    }}>
      {children}
    </button>
  )
}

type BadgeVariant = 'default'|'tag'|'success'|'muted'

function Badge({ text, variant = 'default' }: { text: string; variant?: BadgeVariant }) {
  const cfgs: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    default: { bg: S2,                           color: T2,    border: BORDER },
    tag:     { bg: 'rgba(178,34,52,0.07)',       color: RED,   border: 'rgba(178,34,52,0.22)' },
    success: { bg: 'rgba(30,123,52,0.09)',       color: GREEN, border: 'rgba(30,123,52,0.25)' },
    muted:   { bg: 'rgba(26,26,26,0.05)',        color: T2,    border: BLIGHT },
  }
  const c = cfgs[variant]
  return (
    <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: S1, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '18px 20px', ...style }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Top Navigation
// ─────────────────────────────────────────────────────────────────────────────
function TopNav() {
  const router = useRouter()

  return (
    <header style={{
      height: 56, background: S1, borderBottom: `1px solid ${BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 15, fontWeight: 400, color: RED, letterSpacing: '0.07em' }}>
          ADMO
        </span>
        <span style={{ color: BORDER, fontSize: 13 }}>|</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: T1 }}>Video Studio</span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          background: S1, color: T1, border: `1px solid ${BORDER}`, cursor: 'pointer',
        }}>
          Creation Canvas
        </button>
        <button
          onClick={() => router.push('/campaigns')}
          style={{
            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: 'transparent', color: T2, border: '1px solid transparent',
            cursor: 'pointer', transition: 'color 0.3s',
          }}
        >
          My Campaigns
        </button>
      </div>

      <div style={{
        width: 30, height: 30, borderRadius: '50%', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 500, color: '#FFFFFF',
      }}>
        M
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Progress Bar
// ─────────────────────────────────────────────────────────────────────────────
function StageBar({ current, max, go }: { current: Stage; max: Stage; go: (s: Stage) => void }) {
  return (
    <div style={{
      height: 48, background: S1, borderBottom: `1px solid ${BLIGHT}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 2, flexShrink: 0, padding: '0 16px',
    }}>
      {STAGE_LBL.map((lbl, i) => {
        const s       = (i + 1) as Stage
        const done    = s < current
        const act     = s === current
        const locked  = s > max          // not yet reached
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => !locked && go(s)}
              disabled={locked}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                background: act ? T1 : done ? 'rgba(26,26,26,0.07)' : 'transparent',
                color:      act ? '#FFFFFF' : done ? T1 : locked ? 'rgba(95,94,90,0.35)' : T2,
                border:     act ? 'none' : done ? `1px solid rgba(26,26,26,0.20)` : `1px solid ${locked ? 'rgba(232,228,222,0.4)' : BLIGHT}`,
                cursor:     locked ? 'default' : 'pointer',
                opacity:    locked ? 0.45 : 1,
                transition: 'all 0.3s',
              }}
            >
              {done && <span style={{ fontSize: 9, lineHeight: 1 }}>✓</span>}
              {lbl}
            </button>
            {i < STAGE_LBL.length - 1 && (
              <span style={{ color: BORDER, fontSize: 14, margin: '0 1px', userSelect: 'none', lineHeight: 1 }}>›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({ msgs, onSend, loading }: { msgs: Msg[]; onSend: (t: string) => void; loading: boolean }) {
  const [val, setVal] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const submit = () => {
    const t = val.trim()
    if (!t || loading) return
    onSend(t)
    setVal('')
  }

  return (
    <aside style={{
      width: '33.333%', flexShrink: 0,
      background: S1, borderRight: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${BLIGHT}`, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: T1 }}>AI Assistant</div>
        <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>Describe your campaign — I'll fill in the brief</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 8 }}>
            {m.role === 'ai' && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: RED,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontWeight: 500, color: '#FFFFFF', flexShrink: 0, marginTop: 1,
              }}>
                AI
              </div>
            )}
            <div style={{
              maxWidth: '78%', padding: '9px 13px',
              borderRadius: m.role === 'ai' ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
              background: m.role === 'ai' ? BG : T1,
              border: `1px solid ${m.role === 'ai' ? BORDER : 'transparent'}`,
              fontSize: 12, lineHeight: 1.6,
              color: m.role === 'ai' ? T1 : '#FFFFFF',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: RED,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 500, color: '#FFFFFF', flexShrink: 0, marginTop: 1,
            }}>
              AI
            </div>
            <div style={{
              padding: '9px 13px', borderRadius: '2px 10px 10px 10px',
              background: BG, border: `1px solid ${BORDER}`,
              fontSize: 12, color: T2, fontStyle: 'italic',
            }}>
              Thinking…
            </div>
          </div>
        )}

        <div ref={endRef} style={{ paddingBottom: 12 }} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${BLIGHT}`, display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Describe your campaign…"
          disabled={loading}
          style={{
            flex: 1, background: S2, border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: '8px 12px', fontSize: 12, color: T1,
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button onClick={submit} disabled={loading} style={{
          padding: '8px 16px', borderRadius: 6, background: RED,
          color: '#FFFFFF', border: 'none', fontSize: 12, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.3s',
        }}>
          Send
        </button>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — Brief
// ─────────────────────────────────────────────────────────────────────────────
function StageBrief({
  data, set, onGenerate, generating,
}: {
  data: Brief
  set: (d: Brief) => void
  onGenerate: () => void
  generating: boolean
}) {
  const valid = data.brief.length >= 20 && !!data.theme && !!data.platform && !!data.duration

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: T1, marginBottom: 6 }}>
          Tell the AI what this video is about
        </h1>
        <p style={{ fontSize: 12, color: T2 }}>Chat with the AI on the left to fill in your brief, or edit the fields directly.</p>
      </div>

      <div>
        <FieldLabel>Campaign Brief</FieldLabel>
        <textarea
          value={data.brief}
          onChange={e => set({ ...data, brief: e.target.value })}
          placeholder="Describe the campaign goal, key messages, and tone you're aiming for…"
          rows={4}
          style={{
            width: '100%', background: S2, border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: '10px 12px', fontSize: 12, color: T1,
            resize: 'vertical', lineHeight: 1.65,
          }}
        />
        <div style={{ fontSize: 10, marginTop: 4, color: data.brief.length >= 20 ? T2 : RED }}>
          {data.brief.length} characters
          {data.brief.length < 20 ? ` — ${20 - data.brief.length} more required` : '  ✓'}
        </div>
      </div>

      <div>
        <FieldLabel>Theme</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {THEMES.map(t => (
            <SelectPill key={t} on={data.theme === t} onClick={() => set({ ...data, theme: t })}>{t}</SelectPill>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Platform</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLATFORMS.map(p => (
              <SelectPill key={p} on={data.platform === p} onClick={() => set({ ...data, platform: p })}>{p}</SelectPill>
            ))}
          </div>
        </div>
        <div style={{ width: 110, flexShrink: 0 }}>
          <FieldLabel>Aspect Ratio</FieldLabel>
          <div style={{
            background: S2, border: `1px solid ${BLIGHT}`, borderRadius: 6,
            padding: '8px 12px', fontSize: 13, fontWeight: 500,
            color: data.platform ? T1 : T2,
          }}>
            {ar(data.platform)}
          </div>
          {data.platform && (
            <div style={{ fontSize: 10, color: T2, marginTop: 4 }}>Auto-locked</div>
          )}
        </div>
      </div>

      <div>
        <FieldLabel>Duration</FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {DURATIONS.map(d => (
            <SelectPill key={d} on={data.duration === d} onClick={() => set({ ...data, duration: d })}>{d}</SelectPill>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <ActionBtn onClick={onGenerate} disabled={!valid || generating}>
          {generating ? 'Generating script…' : 'Generate script →'}
        </ActionBtn>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — Script
// ─────────────────────────────────────────────────────────────────────────────
function StageScript({
  brief, script, scenes, next, onRegenerate, generating,
}: {
  brief: Brief
  script: string
  scenes: Scene[]
  next: () => void
  onRegenerate: () => void
  generating: boolean
}) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: T1, marginBottom: 10 }}>
            Your AI-Generated Script
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[brief.theme, brief.platform, brief.duration, scenes.length ? `${scenes.length} scenes` : ''].filter(Boolean).map((tag, i) => (
              <Badge key={i} text={tag} variant="tag" />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <ActionBtn variant="ghost" onClick={onRegenerate} disabled={generating}>
            {generating ? 'Regenerating…' : 'Regenerate'}
          </ActionBtn>
          <ActionBtn onClick={next} disabled={generating || scenes.length === 0}>
            Confirm & render →
          </ActionBtn>
        </div>
      </div>

      <Card>
        <FieldLabel>Full Voiceover</FieldLabel>
        {generating ? (
          <div style={{ padding: '24px 0', fontSize: 12, color: T2, fontStyle: 'italic' }}>
            Generating script…
          </div>
        ) : (
          <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 14, lineHeight: 1.85, color: T1, whiteSpace: 'pre-wrap', marginTop: 4 }}>
            {script}
          </p>
        )}
      </Card>

      {!generating && scenes.length > 0 && (
        <div>
          <FieldLabel>Scene Breakdown</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {scenes.map((scene, i) => (
              <div key={i} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: S1, border: `1px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 500, color: RED, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T2, marginBottom: 5 }}>Scene {i + 1} · ~5s</div>
                  <p style={{ fontSize: 12, color: T1, lineHeight: 1.65 }}>{scene.vo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3 — Rendering  (triggers n8n, polls for completion)
// ─────────────────────────────────────────────────────────────────────────────
function StageRendering({
  executionId, triggerError, onComplete, next, onRetry,
}: {
  executionId: string | null   // set by parent's event handler — never double-fires
  triggerError: string
  onComplete: (videoUrls: string[]) => void
  next: () => void
  onRetry: () => void
}) {
  const [pct, setPct]         = useState(0)
  const [renderStatus, setRenderStatus] = useState<'running'|'success'|'error'>('running')
  const [errorMsg, setErrorMsg]         = useState('')
  const nextRef      = useRef(next)
  const completeRef  = useRef(onComplete)
  const advancedRef  = useRef(false)
  useEffect(() => { nextRef.current = next }, [next])
  useEffect(() => { completeRef.current = onComplete }, [onComplete])

  // Show trigger-level errors immediately (e.g. can't reach n8n)
  useEffect(() => {
    if (triggerError) { setErrorMsg(triggerError); setRenderStatus('error') }
  }, [triggerError])

  const count = 1

  // Poll for execution status — only runs once executionId is known
  useEffect(() => {
    if (!executionId) return
    setRenderStatus('running')
    setPct(0)
    setErrorMsg('')

    let cancelled = false
    const poll = setInterval(async () => {
      if (cancelled) { clearInterval(poll); return }
      try {
        const res = await fetch(`/api/render/status?executionId=${executionId}`)
        const status = await res.json()
        if (status.status === 'success') {
          clearInterval(poll)
          setPct(100)
          setRenderStatus('success')
          completeRef.current(status.videoUrls ?? [])
          setTimeout(() => {
            if (!advancedRef.current) { advancedRef.current = true; nextRef.current() }
          }, 1500)
        } else if (status.status === 'error') {
          clearInterval(poll)
          setErrorMsg(status.error ?? 'Workflow failed')
          setRenderStatus('error')
        }
      } catch { /* keep polling */ }
    }, 5000)

    return () => { cancelled = true; clearInterval(poll) }
  // executionId changes only when parent fires a new render (event handler)
  }, [executionId])

  // Animate progress up to 90% while n8n is running, jump to 100% on success
  useEffect(() => {
    if (renderStatus !== 'running') return
    const id = setInterval(() => setPct(p => p < 90 ? +(p + 0.4).toFixed(1) : 90), 300)
    return () => clearInterval(id)
  }, [renderStatus])

  const done = renderStatus === 'success'

  const scSt = Array.from({ length: count }, (_, i) => {
    const hi = ((i + 1) / count) * 100
    const lo = (i / count) * 100
    if (pct >= hi) return 'complete'
    if (pct >= lo) return 'rendering'
    return 'pending'
  })

  const doneCount = scSt.filter(s => s === 'complete').length

  if (renderStatus === 'error') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '32px 36px' }}>
        <div style={{ fontSize: 32 }}>⚠</div>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 400, color: T1 }}>Rendering failed</h1>
        <p style={{ fontSize: 12, color: T2, textAlign: 'center', maxWidth: 400 }}>{errorMsg || 'Could not connect to the n8n video generation workflow.'}</p>
        <ActionBtn onClick={onRetry}>Retry</ActionBtn>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: T1, marginBottom: 6 }}>
          {done ? 'Videos generated' : 'Generating your videos'}
        </h1>
        <p style={{ fontSize: 12, color: T2 }}>
          {done ? 'Moving to review in a moment…' : 'n8n is processing your scenes. This may take a few minutes.'}
        </p>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T1 }}>Overall Progress</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: done ? GREEN : RED }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 5, background: S2, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: done ? GREEN : RED,
            borderRadius: 3, transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: 11, color: done ? GREEN : T2, marginTop: 9 }}>
          {done
            ? `✓ All ${count} scenes complete`
            : `Processing scene ${Math.min(doneCount + 1, count)} of ${count}…`}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {scSt.map((status, i) => (
          <div key={i} style={{
            background: S1, borderRadius: 8,
            border: `1px solid ${status === 'complete' ? 'rgba(30,123,52,0.30)' : BORDER}`,
            padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
            transition: 'border-color 0.4s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: T1 }}>Scene {i + 1}</span>
              <Badge
                text={status === 'complete' ? 'Complete' : status === 'rendering' ? 'Rendering' : 'Pending'}
                variant={status === 'complete' ? 'success' : status === 'rendering' ? 'tag' : 'muted'}
              />
            </div>

            <div style={{
              height: 96, background: S2, borderRadius: 6, border: `1px solid ${BLIGHT}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {status === 'rendering' && (
                <div style={{
                  width: 20, height: 20, border: `2px solid ${RED}`,
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                }} />
              )}
              {status === 'complete' && <span style={{ fontSize: 22, color: GREEN }}>✓</span>}
              {status === 'pending'  && <span style={{ fontSize: 11, color: T2, opacity: 0.45 }}>Pending</span>}
            </div>

            <div style={{ fontSize: 11, color: T2 }}>
              {status === 'complete'  && <span style={{ color: GREEN }}>Ready for review</span>}
              {status === 'rendering' && 'Generating…'}
              {status === 'pending'   && 'Waiting…'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4 — Approve  (single final video review)
// ─────────────────────────────────────────────────────────────────────────────
function StageApprove({
  brief, videoUrls, scenes, next, onRegenerate,
}: {
  brief: Brief
  videoUrls: string[]
  scenes: Scene[]
  next: () => void
  onRegenerate: (updatedScenes: Scene[]) => void
}) {
  const finalUrl = videoUrls.find(u => /\/final\.mp4/i.test(u)) ?? videoUrls[videoUrls.length - 1]
  const [showRegen, setShowRegen]         = useState(false)
  const [instruction, setInstruction]     = useState('')
  const [applying, setApplying]           = useState(false)
  const [updatedScenes, setUpdatedScenes] = useState<Scene[] | null>(null)
  const [applyError, setApplyError]       = useState('')

  const applyInstruction = async () => {
    if (!instruction.trim()) return
    setApplying(true)
    setApplyError('')
    setUpdatedScenes(null)
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes, brief, instruction }),
      })
      const data = await res.json()
      if (data.scenes) setUpdatedScenes(data.scenes)
      else setApplyError('Could not parse updated scenes.')
    } catch {
      setApplyError('Request failed. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const updateScene = (i: number, field: 'prompt' | 'vo', value: string) => {
    setUpdatedScenes(prev => prev!.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const submitRegen = () => {
    setShowRegen(false)
    onRegenerate(updatedScenes ?? scenes)
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: T1, marginBottom: 5 }}>
          Video Review
        </h1>
        <p style={{ fontSize: 12, color: T2 }}>Review your final video — all scenes merged with voiceover.</p>
      </div>

      {/* Main content: video + metadata side by side */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flex: 1 }}>

        {/* Video player — 9:16 portrait */}
        <div style={{
          flexShrink: 0, width: 280,
          background: '#000', borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${BORDER}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          {finalUrl ? (
            <video
              src={finalUrl}
              controls
              autoPlay={false}
              style={{ width: '100%', display: 'block' }}
            />
          ) : (
            <div style={{
              aspectRatio: '9/16', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              background: S2,
            }}>
              <span style={{ fontSize: 28, opacity: 0.25 }}>▶</span>
              <span style={{ fontSize: 11, color: T2 }}>No video available</span>
            </div>
          )}
        </div>

        {/* Right panel: metadata + approve */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4 }}>

          <Card>
            <FieldLabel>Campaign Details</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {[brief.theme, brief.platform, brief.duration, ar(brief.platform)].filter(Boolean).map((tag, i) => (
                <Badge key={i} text={tag} variant="tag" />
              ))}
            </div>
          </Card>

          <Card>
            <FieldLabel>Output</FieldLabel>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Format',     value: 'MP4' },
                { label: 'Aspect',     value: ar(brief.platform) || '9:16' },
                { label: 'Audio',      value: 'Voiceover included' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: T2 }}>{label}</span>
                  <span style={{ color: T1, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {finalUrl && (
            <Card>
              <FieldLabel>Download</FieldLabel>
              <a
                href={finalUrl}
                download
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block', marginTop: 8, fontSize: 12,
                  color: RED, textDecoration: 'none', fontWeight: 500,
                }}
              >
                ↓ Download final.mp4
              </a>
            </Card>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 10 }}>
            <ActionBtn onClick={next}>Approve &amp; Export →</ActionBtn>
            <ActionBtn variant="ghost" onClick={() => setShowRegen(v => !v)}>
              {showRegen ? 'Cancel' : '↺ Regenerate'}
            </ActionBtn>
          </div>
        </div>
      </div>

      {/* Regenerate panel */}
      {showRegen && (
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: T1, marginBottom: 4 }}>Regenerate with changes</h2>
            <p style={{ fontSize: 12, color: T2 }}>Describe what you want changed — GPT will update the prompts and/or voiceover accordingly.</p>
          </div>

          {/* Chat input */}
          <Card>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); applyInstruction() } }}
                placeholder='e.g. "Use drone shots for all scenes" or "Make the voiceover more energetic"'
                rows={2}
                style={{
                  flex: 1, background: S2, border: `1px solid ${BORDER}`, borderRadius: 6,
                  padding: '8px 10px', fontSize: 12, color: T1, resize: 'none',
                  fontFamily: 'inherit', lineHeight: 1.5, outline: 'none',
                }}
              />
              <button
                onClick={applyInstruction}
                disabled={applying || !instruction.trim()}
                style={{
                  padding: '9px 18px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  background: applying || !instruction.trim() ? S2 : RED,
                  color: applying || !instruction.trim() ? T2 : '#fff',
                  border: `1px solid ${BORDER}`, cursor: applying || !instruction.trim() ? 'default' : 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {applying ? 'Applying…' : 'Apply'}
              </button>
            </div>
            {applyError && <p style={{ fontSize: 11, color: RED, marginTop: 6 }}>{applyError}</p>}
          </Card>

          {/* Updated scenes preview */}
          {updatedScenes && (
            <>
              <div style={{ fontSize: 12, color: T2 }}>Preview of updated scenes — edit if needed, then regenerate:</div>
              {updatedScenes.map((scene, i) => (
                <Card key={i}>
                  <FieldLabel>Scene {i + 1}</FieldLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: T2, marginBottom: 3 }}>VIDEO PROMPT</div>
                      <textarea
                        value={scene.prompt}
                        onChange={e => updateScene(i, 'prompt', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: S2, border: `1px solid ${BORDER}`, borderRadius: 6,
                          padding: '6px 8px', fontSize: 12, color: T1, lineHeight: 1.5,
                          resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ height: 1, background: BLIGHT }} />
                    <div>
                      <div style={{ fontSize: 10, color: T2, marginBottom: 3 }}>VOICEOVER</div>
                      <textarea
                        value={scene.vo}
                        onChange={e => updateScene(i, 'vo', e.target.value)}
                        rows={2}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: S2, border: `1px solid ${BORDER}`, borderRadius: 6,
                          padding: '6px 8px', fontSize: 12, color: T1, lineHeight: 1.5,
                          resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <div>
                <ActionBtn onClick={submitRegen}>Regenerate video →</ActionBtn>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 5 — Export  (was stage 6)
// ─────────────────────────────────────────────────────────────────────────────
function StageExport({ brief, sceneCount, videoUrls, reset }: { brief: Brief; sceneCount: number; videoUrls: string[]; reset: () => void }) {
  const [copied,     setCopied]     = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const reviewUrl = 'review.admo.studio/c/abu-dhabi-safety-0527'

  const finalUrl = videoUrls.find(u => /\/final\.mp4/i.test(u)) ?? videoUrls[videoUrls.length - 1]

  const copy = () => {
    navigator.clipboard.writeText(reviewUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const download = async () => {
    if (!finalUrl) return
    setDownloaded(true)
    try {
      const res = await fetch(finalUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'campaign-video.mp4'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(finalUrl, '_blank')
    }
    setTimeout(() => setDownloaded(false), 2500)
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: T1 }}>
            Abu Dhabi Campaign
          </h1>
          <Badge text="Exported" variant="success" />
        </div>
        <p style={{ fontSize: 12, color: T2 }}>{sceneCount} scenes approved and ready for distribution.</p>
      </div>

      {finalUrl && (
        <Card>
          <FieldLabel>Video Preview</FieldLabel>
          <video
            src={finalUrl}
            controls
            playsInline
            style={{
              width: '100%', marginTop: 10, borderRadius: 6,
              background: '#000', display: 'block',
            }}
          />
        </Card>
      )}

      <Card>
        <FieldLabel>Shareable Review Link</FieldLabel>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
          <div style={{
            flex: 1, background: S2, border: `1px solid ${BLIGHT}`,
            borderRadius: 6, padding: '9px 12px', fontSize: 12, color: T2,
            fontFamily: '"Roboto Mono", "Courier New", monospace',
          }}>
            {reviewUrl}
          </div>
          <button onClick={copy} style={{
            padding: '9px 16px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: copied ? 'rgba(30,123,52,0.09)' : S1,
            color: copied ? GREEN : T1,
            border: `1px solid ${copied ? 'rgba(30,123,52,0.28)' : BORDER}`,
            cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap',
          }}>
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: T2, marginTop: 7 }}>Expires in 30 days · Password protected</div>
      </Card>

      <Card>
        <FieldLabel>Download</FieldLabel>
        <p style={{ fontSize: 12, color: T2, marginBottom: 14, marginTop: 4 }}>
          Download all {sceneCount} scenes as a bundled package optimised for {brief.platform || 'Instagram'} ({ar(brief.platform || 'Instagram')}, 1080p).
        </p>
        <button onClick={download} style={{
          padding: '11px 32px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: downloaded ? 'rgba(30,123,52,0.09)' : RED,
          color: downloaded ? GREEN : '#FFFFFF',
          border: downloaded ? `1px solid rgba(30,123,52,0.28)` : 'none',
          cursor: 'pointer', transition: 'all 0.3s',
        }}>
          {downloaded ? '✓ Downloaded' : 'Download package →'}
        </button>
      </Card>

      <Card>
        <FieldLabel>Campaign Summary</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <div style={{
            width: 56, height: 38, background: S2, borderRadius: 6,
            border: `1px solid ${BLIGHT}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, opacity: 0.25 }}>▶</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T1, marginBottom: 2 }}>Abu Dhabi Campaign</div>
            <div style={{ fontSize: 11, color: T2 }}>
              {brief.platform || 'Instagram'} · {brief.duration || '30s'} · {ar(brief.platform || 'Instagram')}
            </div>
          </div>

          {[
            { k: 'Scenes',     v: String(sceneCount) },
            { k: 'Duration',   v: brief.duration  || '30s' },
            { k: 'Resolution', v: '1080p' },
          ].map(({ k, v }) => (
            <div key={k} style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T1 }}>{v}</div>
              <div style={{ fontSize: 10, color: T2, marginTop: 1 }}>{k}</div>
            </div>
          ))}

          <Badge text="Exported" variant="success" />
        </div>
      </Card>

      <div style={{ height: 1, background: BLIGHT }} />

      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 12 }}>
        <ActionBtn onClick={reset} variant="ghost">+ New campaign</ActionBtn>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root page
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
  const [stage, setStage]           = useState<Stage>(1)
  const [maxStage, setMaxStage]     = useState<Stage>(1)
  const [msgs, setMsgs]             = useState<Msg[]>(INIT_CHAT)
  const [brief, setBrief]           = useState<Brief>(INIT_BRIEF)
  const [script, setScript]         = useState('')
  const [scenes, setScenes]         = useState<Scene[]>([])
  const [videoUrls, setVideoUrls]   = useState<string[]>([])
  const [chatLoading, setChatLoading]         = useState(false)
  const [generatingScript, setGeneratingScript] = useState(false)
  const [renderExecId, setRenderExecId]   = useState<string | null>(null)
  const [renderTriggerErr, setRenderTriggerErr] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = parseInt(params.get('stage') ?? '', 10)
    if (s >= 1 && s <= 5) setStage(s as Stage)
  }, [])

  const go = (s: Stage) => {
    setStage(s)
    setMaxStage(prev => s > prev ? s : prev)
  }

  const sendChat = async (text: string) => {
    const userMsg: Msg = { role: 'user', text }
    setMsgs(prev => [...prev, userMsg])
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, userMsg], brief }),
      })
      const data = await res.json()
      if (data.briefUpdate) {
        setBrief(prev => ({
          brief:    data.briefUpdate.brief    ?? prev.brief,
          theme:    data.briefUpdate.theme    ?? prev.theme,
          platform: data.briefUpdate.platform ?? prev.platform,
          duration: data.briefUpdate.duration ?? prev.duration,
        }))
      }
      setMsgs(prev => [...prev, { role: 'ai', text: data.message || 'Something went wrong.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const generateScript = async (): Promise<boolean> => {
    setGeneratingScript(true)
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      })
      const data = await res.json()
      setScript(data.script || '')
      setScenes(data.scenes || [])
      return true
    } catch {
      return false
    } finally {
      setGeneratingScript(false)
    }
  }

  const handleGenerateAndAdvance = async () => {
    const ok = await generateScript()
    if (ok) go(2)
  }

  // Called from the "Render" button — a plain event handler, never double-fires
  const triggerRender = async (currentScenes: Scene[]) => {
    setRenderExecId(null)
    setRenderTriggerErr('')
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, scenes: currentScenes }),
      })
      const data = await res.json()
      if (data.error) { setRenderTriggerErr(data.error); return }
      setRenderExecId(data.executionId ?? null)
    } catch (e) {
      setRenderTriggerErr(String(e))
    }
  }

  const handleRenderComplete = (urls: string[]) => {
    setVideoUrls(urls)
  }

  const reset = () => {
    setStage(1)
    setBrief(INIT_BRIEF)
    setMsgs(INIT_CHAT)
    setScript('')
    setScenes([])
    setVideoUrls([])
    setRenderExecId(null)
    setRenderTriggerErr('')
    setMaxStage(1)
  }

  // Fallback scenes for approve/export if scenes state was lost
  const approveScenes = scenes.length
    ? scenes
    : Array.from({ length: 6 }, (_, i) => ({ vo: `Scene ${i + 1} voiceover`, prompt: '' }))

  return (
    <div style={{
      background: BG, color: T1,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopNav />
      <StageBar current={stage} max={maxStage} go={go} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <ChatPanel msgs={msgs} onSend={sendChat} loading={chatLoading} />

        <main style={{ flex: 1, overflow: 'hidden', background: BG, minWidth: 0 }}>
          {stage === 1 && <StageBrief data={brief} set={setBrief} onGenerate={handleGenerateAndAdvance} generating={generatingScript} />}
          {stage === 2 && <StageScript brief={brief} script={script} scenes={scenes} next={() => { go(3); triggerRender(scenes) }} onRegenerate={generateScript} generating={generatingScript} />}
          {stage === 3 && <StageRendering executionId={renderExecId} triggerError={renderTriggerErr} onComplete={handleRenderComplete} next={() => go(4)} onRetry={() => triggerRender(scenes)} />}
          {stage === 4 && <StageApprove brief={brief} videoUrls={videoUrls} scenes={scenes} next={() => go(5)} onRegenerate={updated => { setScenes(updated); setVideoUrls([]); go(3); triggerRender(updated) }} />}
          {stage === 5 && <StageExport brief={brief} sceneCount={scenes.length || 6} videoUrls={videoUrls} reset={reset} />}
        </main>
      </div>
    </div>
  )
}
