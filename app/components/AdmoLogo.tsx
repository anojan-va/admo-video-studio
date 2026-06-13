export function AdmoLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{
        fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: '-0.01em',
        background: 'linear-gradient(to right, #FF6B00, #F5A623)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text' as const,
        lineHeight: 1,
        display: 'inline-block',
      }}>ADM</span>

      <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
        <defs>
          <linearGradient id="admo-o-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#F5A623" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#admo-o-grad)" />
        <polygon points="10,8 17,12 10,16" fill="white" />
      </svg>

      <div style={{ width: 1, height: 24, background: '#FFFFFF', opacity: 0.6, margin: '0 12px', flexShrink: 0 }} />

      <span style={{
        fontSize: 18,
        fontWeight: 300,
        color: '#FFFFFF',
        letterSpacing: '0.02em',
      }}>video studio</span>
    </div>
  )
}
