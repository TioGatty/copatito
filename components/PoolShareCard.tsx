'use client'

import { useState } from 'react'
import type { Pool } from '@/lib/types/pool'

export default function PoolShareCard({ pool }: { pool: Pool }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/pools/join?code=${pool.code}`
    : `/pools/join?code=${pool.code}`

  async function copy(value: string, kind: 'code' | 'link') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // fallback: select-all
    }
  }

  async function share() {
    const text = `Unite a mi pool del Mundial 2026 en CopaTío: ${link}\nCódigo: ${pool.code}`
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator).share({ title: pool.name, text, url: link })
      } catch { /* user canceled */ }
    } else {
      copy(text, 'link')
    }
  }

  return (
    <div className="card-2" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>
        Invitar amigos
      </div>

      <button
        onClick={() => copy(pool.code, 'code')}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'var(--pill-gold-bg)', border: '0.5px solid var(--gold-deep)',
          borderRadius: 14, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontFamily: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Código
        </span>
        <span className="mono" style={{
          fontSize: 24, fontWeight: 700, color: 'var(--gold)',
          letterSpacing: '0.2em',
        }}>{pool.code}</span>
        <span style={{ fontSize: 11, color: copied === 'code' ? 'var(--pitch)' : 'var(--t-3)', fontWeight: 600 }}>
          {copied === 'code' ? '✓ Copiado' : 'Copiar'}
        </span>
      </button>

      <button
        onClick={share}
        style={{
          width: '100%', padding: '12px 16px',
          background: 'var(--gold)', color: 'var(--btn-primary-text)',
          border: 'none', borderRadius: 12,
          fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v14"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Compartir link
      </button>
    </div>
  )
}
