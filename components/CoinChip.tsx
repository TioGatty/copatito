import Link from 'next/link'

export default function CoinChip({ balance }: { balance: number }) {
  return (
    <Link
      href="/pools"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 999,
        background: 'var(--pill-gold-bg)',
        border: '0.5px solid var(--gold-deep)',
        color: 'var(--gold)',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
        textDecoration: 'none', WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Saldo de monedas"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" opacity="0.25"/>
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
        <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor">C</text>
      </svg>
      <span className="mono">{balance}</span>
    </Link>
  )
}
