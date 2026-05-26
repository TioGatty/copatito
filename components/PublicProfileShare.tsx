'use client'

import { useState } from 'react'

export default function PublicProfileShare({ code, name }: { code: string; name: string }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/u/${code}` : `/u/${code}`

  async function share() {
    if (typeof navigator === 'undefined') return
    const text = `Mirá las predicciones de ${name} en CopaTío Mundial 2026: ${link}`
    const canShare = typeof (navigator as Navigator).share === 'function'
    if (canShare) {
      try { await (navigator as Navigator).share({ title: `${name} · CopaTío`, text, url: link }) } catch {}
    } else {
      try {
        await (navigator as Navigator).clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {}
    }
  }

  return (
    <button
      onClick={share}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'var(--bg-2)', border: '0.5px solid var(--line-soft)',
        borderRadius: 12, color: 'var(--t-1)',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v14"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {copied ? '✓ Link copiado' : 'Compartir perfil'}
    </button>
  )
}
