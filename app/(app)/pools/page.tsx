export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PoolsActions from '@/components/PoolsActions'
import { getCoinBalance, getUserPools } from '@/lib/pools/fetch'

function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="currentColor">C</text>
    </svg>
  )
}

export default async function PoolsPage() {
  const [coins, pools] = await Promise.all([
    getCoinBalance(),
    getUserPools(),
  ])

  return (
    <div className="screen-body">
      {/* Header */}
      <div style={{ padding: '4px 20px 12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at top right, oklch(0.65 0.22 5 / 0.15), transparent 60%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Mis Pools
          </h1>
          <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
            Competencias privadas del Mundial 2026
          </div>
        </div>
      </div>

      {/* Coin balance + daily bonus */}
      <div style={{ padding: '0 20px 12px' }}>
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--pill-gold-bg)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CoinIcon size={22}/>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Tus monedas
              </div>
              <div className="mono display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                {coins}
              </div>
            </div>
          </div>
          <PoolsActions coins={coins}/>
        </div>
      </div>

      {/* My pools list */}
      <div style={{ padding: '4px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
          {pools.length === 0 ? 'Sin pools aún' : `${pools.length} pool${pools.length === 1 ? '' : 's'}`}
        </div>

        {pools.length === 0 ? (
          <div className="empty">
            <div className="icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="title">Sin pools todavía</div>
            <div className="desc">Creá uno o unite con un código. Vos elegís el costo (default 10), cada miembro paga lo mismo.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pools.map(p => (
              <Link
                key={p.id}
                href={`/pools/${p.id}`}
                className="card"
                style={{
                  padding: 14, textDecoration: 'none', color: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, color: 'var(--t-3)' }}>
                    <span className="mono">{p.code}</span>
                    <span>·</span>
                    <span>{p.member_count} miembro{p.member_count === 1 ? '' : 's'}</span>
                    {p.is_creator && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>creador</span>
                      </>
                    )}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--t-3)', flexShrink: 0 }}>
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}
