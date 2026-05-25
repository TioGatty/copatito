import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', textAlign: 'center',
      background: 'var(--bg-0)', color: 'var(--t-1)',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 24,
        background: 'var(--accent-soft)', color: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, marginBottom: 20,
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        🤔
      </div>
      <h1 className="display" style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
        Página no encontrada
      </h1>
      <p style={{ fontSize: 14, color: 'var(--t-3)', maxWidth: 320, lineHeight: 1.5, margin: '0 0 24px' }}>
        El link puede estar mal o el contenido ya no existe.
      </p>
      <Link href="/home" style={{
        padding: '12px 24px', borderRadius: 12,
        background: 'var(--gold)', color: 'var(--btn-primary-text)',
        textDecoration: 'none', fontWeight: 700, fontSize: 14,
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
