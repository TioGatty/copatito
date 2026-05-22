import type { ActivityItem } from '@/lib/activity/fetch'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

function renderItem(it: ActivityItem): { icon: string; bg: string; title: string; subtitle?: string } {
  switch (it.kind) {
    case 'prediction_exact':
      return { icon: '🎉', bg: 'var(--pill-gold-bg)', title: 'Score exacto', subtitle: it.teams }
    case 'prediction_hit':
      return { icon: '✅', bg: 'var(--pill-green-bg)', title: `Acertaste · +${it.points} pts`, subtitle: it.teams }
    case 'achievement':
      return { icon: it.icon, bg: 'var(--accent-soft)', title: `Logro: ${it.title}` }
    case 'pool_create':
      return { icon: '🏗️', bg: 'var(--accent-soft)', title: `Creaste pool`, subtitle: it.poolName }
    case 'pool_join':
      return { icon: '🤝', bg: 'var(--accent-soft)', title: `Te uniste a pool`, subtitle: it.poolName }
    case 'referral':
      return { icon: '🎁', bg: 'var(--pill-gold-bg)', title: `Bonus referido · +${it.amount}` }
  }
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--t-3)', textAlign: 'center' }}>
        Sin actividad reciente.
      </div>
    )
  }
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {items.map((it, i) => {
        const r = renderItem(it)
        return (
          <div key={i} style={{
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: i < items.length - 1 ? '0.5px solid var(--line-soft)' : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: r.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{r.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--t-1)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {r.title}
              </div>
              {r.subtitle && (
                <div style={{
                  fontSize: 11, color: 'var(--t-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.subtitle}</div>
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--t-4)', flexShrink: 0 }}>
              {timeAgo(it.at)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
