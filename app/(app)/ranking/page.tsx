export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getGlobalRanking, getMyGlobalRank } from '@/lib/ranking/fetch'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/Avatar'

function MedalIcon({ rank }: { rank: number }) {
  const color = rank === 1 ? 'var(--gold)' : rank === 2 ? 'var(--t-2)' : 'oklch(0.55 0.12 50)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="14" r="6" stroke={color} strokeWidth="1.4" fill={color} opacity="0.7"/>
      <path d="M8 2h8l-4 8L8 2z" fill={color}/>
    </svg>
  )
}

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const myId = user?.id

  const [rows, mine] = await Promise.all([
    getGlobalRanking(100),
    getMyGlobalRank(),
  ])

  const top = rows.slice(0, 3)
  const rest = rows.slice(3)

  return (
    <div className="screen-body">
      {/* Header */}
      <div style={{ padding: '4px 20px 12px', position: 'relative', overflow: 'hidden' }}>
        <div className="sun-motif" style={{ opacity: 0.3 }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Ranking global
          </h1>
          <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
            {mine?.total_users ?? rows.length} jugadores compiten por el Mundial 2026
          </div>
        </div>
      </div>

      {/* My rank card */}
      {mine && (
        <div style={{ padding: '0 20px 16px' }}>
          <div className="card" style={{
            padding: 16,
            background: 'var(--gradient-rank)',
            border: '0.5px solid var(--gold-deep)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>
              Tu posición
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="display mono" style={{ fontSize: 38, fontWeight: 700, color: 'var(--t-1)', letterSpacing: '-0.03em' }}>
                #{mine.rank}
              </span>
              <span style={{ fontSize: 12, color: 'var(--t-3)' }}>
                de {mine.total_users}
              </span>
              <span style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{mine.points}</div>
                <div style={{ fontSize: 10, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Puntos</div>
              </span>
            </div>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ padding: '0 20px' }}>
          <div className="empty">
            <div className="icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M7 4h10v5a5 5 0 01-10 0V4zM9 19h6M12 14v5"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="title">Ranking vacío</div>
            <div className="desc">Empieza a pronosticar. El ranking se llena cuando los partidos terminan.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top.length > 0 && (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
                Podio
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {top.map((r, i) => (
                  <Row key={r.user_id} row={r} isMe={r.user_id === myId} divider={i < top.length - 1}/>
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
                Top {rows.length}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {rest.map((r, i) => (
                  <Row key={r.user_id} row={r} isMe={r.user_id === myId} divider={i < rest.length - 1}/>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ padding: '8px 20px', fontSize: 11, color: 'var(--t-4)', textAlign: 'center' }}>
        El ranking se actualiza al finalizar cada partido.
      </div>

      <div style={{ padding: '8px 20px' }}>
        <Link href="/home" style={{
          display: 'flex', justifyContent: 'center', padding: 12,
          color: 'var(--t-3)', fontSize: 13, textDecoration: 'none',
        }}>
          ← Volver al inicio
        </Link>
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}

function Row({ row: r, isMe, divider }: { row: import('@/lib/ranking/fetch').RankRow; isMe: boolean; divider: boolean }) {
  const initials = (r.display_name || 'JJ').slice(0, 2).toUpperCase()
  const isPodium = r.rank <= 3
  return (
    <div style={{
      padding: '12px 14px',
      display: 'grid', gridTemplateColumns: '36px 1fr 50px 60px',
      gap: 10, alignItems: 'center',
      borderBottom: divider ? '0.5px solid var(--line-soft)' : 'none',
      background: isMe ? 'var(--accent-soft)' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {isPodium && <MedalIcon rank={r.rank}/>}
        {!isPodium && (
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-3)' }}>#{r.rank}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Avatar initials={initials} preset={r.avatar_preset} size={28}/>
        <span style={{
          fontSize: 13, fontWeight: isMe ? 700 : 600,
          color: isMe ? 'var(--gold)' : 'var(--t-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {r.display_name}{isMe && <span style={{ color: 'var(--t-3)', fontWeight: 500 }}> (vos)</span>}
        </span>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--t-3)', textAlign: 'right' }}>
        {r.hits}/{r.predictions}
      </span>
      <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--t-1)', textAlign: 'right' }}>
        {r.points}
      </span>
    </div>
  )
}
