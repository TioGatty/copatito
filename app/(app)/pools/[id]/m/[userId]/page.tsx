import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Flag, { COUNTRY } from '@/components/Flag'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'

type Row = Prediction & {
  match: (Match & { home_team: Team | null; away_team: Team | null }) | null
}

export default async function MemberPredictionsPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>
}) {
  const { id: poolId, userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Verify both in same pool
  const { data: meIn } = await supabase
    .from('pool_members')
    .select('id')
    .eq('pool_id', poolId)
    .eq('user_id', user.id)
    .single()
  if (!meIn) notFound()

  const { data: themIn } = await supabase
    .from('pool_members')
    .select('id')
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .single()
  if (!themIn) notFound()

  // Their display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()
  const displayName = (profile?.display_name as string | null) ?? 'Jugador'

  // Their predictions (RLS allows: own user's all, or other users only for matches with kickoff <= now)
  const { data: predRaw } = await supabase
    .from('predictions')
    .select('*, match:match_id(*, home_team:home_team_id(*), away_team:away_team_id(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const rows = ((predRaw ?? []) as unknown as Row[]).filter(r => r.match)

  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 8px' }}>
        <Link href={`/pools/${poolId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--t-3)', textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ranking
        </Link>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
          {displayName}
        </h1>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
          Pronósticos visibles (matches que ya comenzaron)
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {rows.length === 0 ? (
          <div className="empty">
            <div className="icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="title">Sin pronósticos visibles</div>
            <div className="desc">Los pronósticos de otros miembros se ven después del kickoff de cada partido.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(r => <MatchRow key={r.id} row={r}/>)}
          </div>
        )}
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}

function MatchRow({ row }: { row: Row }) {
  const p = row
  const m = row.match
  if (!m) return null
  const home = m.home_team
  const away = m.away_team
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (m.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (m.away_placeholder ?? '?')
  const isFinished = m.status === 'finished'

  let badge = null
  if (isFinished && p.points != null) {
    badge = (
      <span className="mono" style={{
        fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        background: p.points > 0 ? 'oklch(0.3 0.1 145 / 0.5)' : 'oklch(0.3 0.05 25 / 0.4)',
        color: p.points > 0 ? 'var(--pitch)' : 'var(--lose)',
      }}>+{p.points}</span>
    )
  } else {
    badge = <span style={{ fontSize: 11, color: 'var(--t-3)' }}>En curso</span>
  }

  return (
    <div style={{
      background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
      borderRadius: 12, padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--t-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {new Date(m.kickoff_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        {badge}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {home && <Flag code={home.code} size={20}/>}
          <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{homeName}</span>
        </div>
        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
          {p.home_score}–{p.away_score}
          {isFinished && m.home_score != null && m.away_score != null && (
            <span style={{ color: 'var(--t-3)', marginLeft: 6, fontWeight: 500 }}>
              ({m.home_score}–{m.away_score})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{awayName}</span>
          {away && <Flag code={away.code} size={20}/>}
        </div>
      </div>
    </div>
  )
}
