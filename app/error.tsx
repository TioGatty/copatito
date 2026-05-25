'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error boundary]', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', textAlign: 'center',
      background: 'var(--bg-0)', color: 'var(--t-1)',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 24,
        background: 'oklch(0.3 0.1 25 / 0.3)', color: 'var(--lose)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, marginBottom: 20,
        border: '0.5px solid var(--danger-border)',
      }}>
        ⚠️
      </div>
      <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
        Algo se rompió
      </h1>
      <p style={{ fontSize: 14, color: 'var(--t-3)', maxWidth: 320, lineHeight: 1.5, margin: '0 0 24px' }}>
        Probá refrescar la página. Si el error sigue, reportanos.
      </p>
      {error.digest && (
        <p className="mono" style={{ fontSize: 10, color: 'var(--t-4)', marginBottom: 20 }}>
          ref: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset} style={{
          padding: '12px 20px', borderRadius: 12,
          background: 'var(--gold)', color: 'var(--btn-primary-text)',
          border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
        }}>Reintentar</button>
        <Link href="/home" style={{
          padding: '12px 20px', borderRadius: 12,
          background: 'var(--bg-2)', border: '0.5px solid var(--line-soft)',
          color: 'var(--t-1)', textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}>Ir a inicio</Link>
      </div>
    </div>
  )
}
