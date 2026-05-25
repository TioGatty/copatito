'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px', textAlign: 'center',
        background: '#1a1208', color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💥</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Error crítico</h1>
        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 20 }}>La app no pudo cargar.</p>
        {error.digest && <p style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.5, marginBottom: 20 }}>ref: {error.digest}</p>}
        <button onClick={reset} style={{
          padding: '12px 24px', borderRadius: 12,
          background: '#d4a017', color: '#1a1208',
          border: 'none', fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
        }}>Reintentar</button>
      </body>
    </html>
  )
}
