export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import Flag, { COUNTRY } from '@/components/Flag'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import HomePendingList from '@/components/HomePendingList'
import CoinChip from '@/components/CoinChip'
import Avatar from '@/components/Avatar'
import { getUserPredictions, getUserTotalPoints } from '@/lib/predictions/fetch'
import { getCoinBalance } from '@/lib/pools/fetch'
import { getMyGlobalRank } from '@/lib/ranking/fetch'

// ─── Icon helpers (inline SVG) ──────────────────────────────
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5h-15L6 16zM10 21a2 2 0 004 0"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}
function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c3 5 6 7 6 11a6 6 0 11-12 0c0-2 1-3 2-4-1 3 1 4 2 4 0-3-1-6 2-11z"/>
    </svg>
  )
}
function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/>
    </svg>
  )
}

// ─── Live match card ─────────────────────────────────────────
function LiveMatchCard({ match }: { match: Match }) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (match.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (match.away_placeholder ?? '?')

  return (
    <div className="card-2" style={{ padding: 14 }}>
      <div className="match" style={{ gap: 8 }}>
        <div className="match-team">
          {home && <Flag code={home.code} size={32}/>}
          <span style={{ fontSize: 14, fontWeight: 700 }}>{homeName}</span>
        </div>
        <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-1)', whiteSpace: 'nowrap' }}>
          {match.home_score ?? 0}<span style={{ color: 'var(--t-4)' }}>:</span>{match.away_score ?? 0}
        </div>
        <div className="match-team away">
          {away && <Flag code={away.code} size={32}/>}
          <span style={{ fontSize: 14, fontWeight: 700 }}>{awayName}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <span className="live-dot"/>
        <span className="mono" style={{ fontSize: 12, color: 'var(--lose)', fontWeight: 700 }}>EN VIVO</span>
        <span style={{ fontSize: 11, color: 'var(--t-3)', marginLeft: 4 }}>{match.venue}</span>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Upcoming matches (next 5 unstarted)
  const now = new Date().toISOString()
  const { data: upcomingRaw } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .eq('status', 'scheduled')
    .gte('kickoff_at', now)
    .order('kickoff_at')
    .limit(3)

  // Live matches
  const { data: liveRaw } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .eq('status', 'live')
    .order('kickoff_at')

  const upcoming = (upcomingRaw ?? []) as Match[]
  const liveMatches = (liveRaw ?? []) as Match[]

  const predictionsMap = await getUserPredictions(upcoming.map(m => m.id))
  const predictions: Record<string, Prediction> = {}
  for (const [k, v] of predictionsMap) predictions[k] = v

  const totalPoints = await getUserTotalPoints()
  const coins = await getCoinBalance()
  const myRank = await getMyGlobalRank()

  // Profile (display_name, avatar)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_preset')
    .eq('id', user?.id ?? '')
    .single()
  const displayName = (profile?.display_name as string | null) ?? user?.email?.split('@')[0] ?? 'Jugador'
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarPreset = (profile?.avatar_preset as number | null) ?? 0

  return (
    <div className="screen-body">
      {/* ─── Hero ─── */}
      <div style={{ position: 'relative', padding: '4px 20px 20px', overflow: 'hidden' }}>
        <div className="sun-motif"/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={initials} preset={avatarPreset} size={38}/>
              <div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Hola,</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{displayName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CoinChip balance={coins}/>
              <ThemeToggle/>
              <button style={{ padding: 8, borderRadius: 999, background: 'transparent', border: 'none', color: 'var(--t-2)', cursor: 'pointer', position: 'relative' }}>
                <BellIcon/>
              </button>
            </div>
          </div>

          {/* Points display */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Tus puntos
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <span className="display mono" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {totalPoints}
              </span>
              <span className="pill" style={{ background: 'var(--pill-green-bg)', color: 'var(--pitch-deep)' }}>
                <ArrowUpIcon/>+0
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
              <Link href="/ranking" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                  {myRank ? `#${myRank.rank}` : '–'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ranking</div>
              </Link>
              <div style={{ width: 1, background: 'var(--line-soft)' }}/>
              <div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--gold)' }}><FlameIcon/></span>0
                </div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</div>
              </div>
              <div style={{ width: 1, background: 'var(--line-soft)' }}/>
              <div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>0%</div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precisión</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live matches ─── */}
      {liveMatches.length > 0 && (
        <>
          <div style={{ padding: '12px 20px 4px' }}>
            <h2 className="display" style={{ fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              En vivo <span className="live-dot"/>
            </h2>
          </div>
          <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveMatches.map(m => <LiveMatchCard key={m.id} match={m}/>)}
          </div>
        </>
      )}

      {/* ─── Upcoming predictions ─── */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 className="display" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Próximos partidos</h2>
        {upcoming.length > 0 && (
          <span className="mono" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>
            {upcoming.length} PENDIENTES
          </span>
        )}
      </div>
      <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <HomePendingList upcoming={upcoming} predictions={predictions}/>
      </div>

      {/* ─── Quick link to bracket ─── */}
      <div style={{ padding: '8px 20px 16px' }}>
        <Link href="/bracket" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 14,
          background: 'oklch(0.3 0.05 75)', border: '0.5px solid oklch(0.4 0.1 75)',
          textDecoration: 'none',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <SparkIcon/> Todos los partidos
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-1)', marginTop: 2 }}>
              Ver el bracket completo del Mundial 2026
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--gold)', flexShrink: 0 }}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <div style={{ height: 8 }}/>
    </div>
  )
}
