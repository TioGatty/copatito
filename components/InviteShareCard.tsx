'use client'

import { useState } from 'react'

export default function InviteShareCard({ code }: { code: string }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${code}`
    : `/?ref=${code}`

  async function copy(value: string, kind: 'code' | 'link') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  async function share() {
    const text = `Pronosticá el Mundial 2026 conmigo en CopaTío. Usá mi código ${code} y los dos ganamos 20 monedas: ${link}`
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator).share({ title: 'CopaTío', text, url: link })
      } catch {}
    } else {
      copy(text, 'link')
    }
  }

  return (
    <div className="card-2" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>
        Tu código
      </div>

      <button
        onClick={() => copy(code, 'code')}
        style={{
          width: '100%', padding: '16px 18px',
          background: 'var(--pill-gold-bg)', border: '0.5px solid var(--gold-deep)',
          borderRadius: 14, marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontFamily: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span className="mono" style={{
          fontSize: 32, fontWeight: 700, color: 'var(--gold)',
          letterSpacing: '0.25em',
        }}>{code}</span>
        <span style={{ fontSize: 12, color: copied === 'code' ? 'var(--pitch)' : 'var(--t-3)', fontWeight: 600 }}>
          {copied === 'code' ? '✓ Copiado' : 'Tocá para copiar'}
        </span>
      </button>

      <button
        onClick={share}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'var(--gold)', color: 'var(--btn-primary-text)',
          border: 'none', borderRadius: 12,
          fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v14"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Compartir invitación
      </button>

      <button
        onClick={() => copy(link, 'link')}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'transparent', border: 'none',
          color: 'var(--t-3)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', marginTop: 6,
        }}
      >
        {copied === 'link' ? '✓ Link copiado' : 'O copiar link directo'}
      </button>
    </div>
  )
}
