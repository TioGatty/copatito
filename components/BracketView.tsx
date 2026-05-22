'use client'

import { useState } from 'react'
import Flag, { COUNTRY } from '@/components/Flag'
import PredictionModal from '@/components/PredictionModal'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import { getPredictionState } from '@/lib/types/prediction'

// ─── Phase tab config ───────────────────────────────────────
const PHASES = [
  { id: 'grupos',  label: 'Grupos',  dbPhase: 'group' },
  { id: '16vos',   label: '16vos',   dbPhase: 'round_of_32' },
  { id: '8vos',    label: '8vos',    dbPhase: 'round_of_16' },
  { id: '4tos',    label: '4tos',    dbPhase: 'quarter' },
  { id: 'semis',   label: 'Semis',   dbPhase: 'semi' },
  { id: 'final',   label: 'Final',   dbPhase: 'final' },
]

type FilterId = 'all' | 'predicted' | 'pending' | 'hit' | 'miss'
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',       label: 'Todos' },
  { id: 'pending',   label: 'Sin pronosticar' },
  { id: 'predicted', label: 'Pronosticados' },
  { id: 'hit',       label: 'Acertados' },
  { id: 'miss',      label: 'Fallados' },
]

function matchPassesFilter(
  m: Match,
  filter: FilterId,
  predictions: Record<string, Prediction>,
): boolean {
  const pred = predictions[m.id]
  switch (filter) {
    case 'all':       return true
    case 'predicted': return pred != null
    case 'pending':
      return pred == null
        && m.status === 'scheduled'
        && getPredictionState(m) === 'open'
        && !!m.home_team_id && !!m.away_team_id
    case 'hit':       return (pred?.points ?? 0) > 0
    case 'miss':      return m.status === 'finished' && pred != null && (pred.points ?? 0) === 0
  }
}

// ─── BracketMatch card ──────────────────────────────────────
function BracketMatch({
  match, prediction, onTap,
}: {
  match: Match
  prediction: Prediction | null
  onTap: (m: Match) => void
}) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null
  const homeCode = home?.code ?? null
  const awayCode = away?.code ?? null
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (match.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (match.away_placeholder ?? '?')

  const isPending = match.status === 'scheduled'
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hs = match.home_score
  const as_ = match.away_score
  const winnerHome = hs !== null && as_ !== null && hs > as_
  const winnerAway = hs !== null && as_ !== null && as_ > hs

  const date = new Date(match.kickoff_at).toLocaleString('es', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  const teamsKnown = !!home && !!away
  const state = getPredictionState(match)
  const tappable = teamsKnown && (state === 'open' || prediction !== null || isFinished)

  let borderColor = 'var(--line)'
  let glowColor = 'transparent'
  if (isLive) { borderColor = 'var(--lose)'; glowColor = 'oklch(0.62 0.2 25 / 0.1)' }
  if (prediction && state === 'open') borderColor = 'var(--gold-deep)'

  // Pronostic badge styling
  let badge: { label: string; bg: string; fg: string } | null = null
  if (isFinished && prediction?.points != null) {
    badge = {
      label: `+${prediction.points} pts`,
      bg: prediction.points > 0 ? 'oklch(0.3 0.1 145 / 0.5)' : 'oklch(0.3 0.05 25 / 0.4)',
      fg: prediction.points > 0 ? 'var(--pitch)' : 'var(--lose)',
    }
  } else if (prediction) {
    badge = {
      label: `${prediction.home_score}-${prediction.away_score}`,
      bg: 'var(--pill-gold-bg)',
      fg: 'var(--gold)',
    }
  } else if (state === 'open' && teamsKnown) {
    badge = { label: 'Pronosticar', bg: 'var(--bg-3)', fg: 'var(--t-2)' }
  }

  return (
    <button
      onClick={() => tappable && onTap(match)}
      disabled={!tappable}
      style={{
        background: `linear-gradient(135deg, ${glowColor}, transparent 60%), var(--bg-1)`,
        border: `0.5px solid ${borderColor}`,
        borderRadius: 14,
        padding: 12,
        position: 'relative',
        width: '100%', textAlign: 'left',
        fontFamily: 'inherit', color: 'inherit',
        cursor: tappable ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isLive && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="live-dot"/>
          <span className="mono" style={{ fontSize: 9, color: 'var(--lose)', fontWeight: 700 }}>VIVO</span>
        </div>
      )}
      {/* Home row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: !isPending && !winnerHome ? 0.5 : 1 }}>
        {homeCode ? <Flag code={homeCode} size={26}/> : (
          <div style={{ width: 39, height: 26, borderRadius: 4, background: 'var(--bg-3)', flexShrink: 0 }}/>
        )}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{homeName}</span>
        <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: winnerHome ? 'var(--gold)' : 'var(--t-2)', minWidth: 14, textAlign: 'right' }}>
          {isPending ? '–' : hs}
        </span>
      </div>
      <div style={{ height: 1, background: 'var(--line-soft)', margin: '8px 0' }}/>
      {/* Away row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: !isPending && !winnerAway ? 0.5 : 1 }}>
        {awayCode ? <Flag code={awayCode} size={26}/> : (
          <div style={{ width: 39, height: 26, borderRadius: 4, background: 'var(--bg-3)', flexShrink: 0 }}/>
        )}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{awayName}</span>
        <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: winnerAway ? 'var(--gold)' : 'var(--t-2)', minWidth: 14, textAlign: 'right' }}>
          {isPending ? '–' : as_}
        </span>
      </div>
      {/* Footer: date + prediction badge */}
      <div style={{
        marginTop: 8, paddingTop: 8, borderTop: '0.5px dashed var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{ fontSize: 11, color: 'var(--t-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isPending ? `${date} · ${match.venue}` : match.venue}
        </span>
        {badge && (
          <span className="mono" style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: badge.bg, color: badge.fg, flexShrink: 0,
          }}>
            {badge.label}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Group standings ───────────────────────────────────────
interface Standing {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  pts: number
}

function computeGroupStandings(matches: Match[]): Standing[] {
  const map = new Map<string, Standing>()
  for (const m of matches) {
    if (!m.home_team || !m.away_team) continue
    const ht = m.home_team as Team
    const at = m.away_team as Team
    if (!map.has(ht.id)) map.set(ht.id, { team: ht, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 })
    if (!map.has(at.id)) map.set(at.id, { team: at, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 })
    if (m.status !== 'finished' || m.home_score === null || m.away_score === null) continue
    const hs = m.home_score, as_ = m.away_score
    const hst = map.get(ht.id)!
    const ast = map.get(at.id)!
    hst.played++; ast.played++
    hst.gf += hs; hst.ga += as_
    ast.gf += as_; ast.ga += hs
    if (hs > as_) { hst.won++; hst.pts += 3; ast.lost++ }
    else if (hs < as_) { ast.won++; ast.pts += 3; hst.lost++ }
    else { hst.drawn++; hst.pts++; ast.drawn++; ast.pts++ }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga
    if (gdB !== gdA) return gdB - gdA
    return b.gf - a.gf
  })
}

function GroupStandings({ matches }: { matches: Match[] }) {
  const standings = computeGroupStandings(matches)
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '10px 14px',
        display: 'grid', gridTemplateColumns: '24px 1fr 30px 30px 30px 30px 30px',
        gap: 6, alignItems: 'center',
        fontSize: 10, color: 'var(--t-3)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        borderBottom: '0.5px solid var(--line-soft)',
      }}>
        <span>#</span>
        <span>Equipo</span>
        <span style={{ textAlign: 'center' }}>PJ</span>
        <span style={{ textAlign: 'center' }}>G</span>
        <span style={{ textAlign: 'center' }}>DG</span>
        <span style={{ textAlign: 'center' }}>Pts</span>
        <span style={{ textAlign: 'center' }}>GF</span>
      </div>
      {standings.map((r, i) => (
        <div key={r.team.id} style={{
          padding: '11px 14px',
          display: 'grid', gridTemplateColumns: '24px 1fr 30px 30px 30px 30px 30px',
          gap: 6, alignItems: 'center',
          borderBottom: i < standings.length - 1 ? '0.5px solid var(--line-soft)' : 'none',
          background: i < 2 ? 'oklch(0.22 0.03 145 / 0.3)' : 'transparent',
        }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: i < 2 ? 'var(--pitch)' : 'var(--t-3)' }}>{i+1}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Flag code={r.team.code} size={24}/>
            <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {COUNTRY[r.team.code] ?? r.team.name}
            </span>
          </span>
          <span className="mono" style={{ textAlign: 'center', fontSize: 13, color: 'var(--t-2)' }}>{r.played}</span>
          <span className="mono" style={{ textAlign: 'center', fontSize: 13, color: 'var(--t-2)' }}>{r.won}</span>
          <span className="mono" style={{ textAlign: 'center', fontSize: 13, color: 'var(--t-2)' }}>
            {r.gf - r.ga > 0 ? '+' + (r.gf - r.ga) : r.gf - r.ga}
          </span>
          <span className="mono" style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--t-1)' }}>{r.pts}</span>
          <span className="mono" style={{ textAlign: 'center', fontSize: 13, color: 'var(--t-2)' }}>{r.gf}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Grupos tab ─────────────────────────────────────────────
interface GroupData {
  name: string
  matches: Match[]
}

function GruposView({
  groups, predictions, filter, onTap,
}: {
  groups: GroupData[]
  predictions: Record<string, Prediction>
  filter: FilterId
  onTap: (m: Match) => void
}) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.name ?? 'A')
  const group = groups.find(g => g.name === selectedGroup) ?? groups[0]
  const filteredMatches = group ? group.matches.filter(m => matchPassesFilter(m, filter, predictions)) : []

  return (
    <div style={{ padding: '8px 20px' }}>
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        scrollbarWidth: 'none', marginBottom: 14, paddingBottom: 4,
      }}>
        {groups.map(g => (
          <button key={g.name}
            onClick={() => setSelectedGroup(g.name)}
            className="btn"
            style={{
              padding: '6px 12px', fontSize: 12, flexShrink: 0,
              borderColor: g.name === selectedGroup ? 'var(--gold)' : 'var(--line)',
              background: g.name === selectedGroup ? 'var(--accent-soft)' : 'var(--bg-2)',
              color: g.name === selectedGroup ? 'var(--selected-text)' : 'var(--t-2)',
            }}
          >
            Grupo {g.name}
          </button>
        ))}
      </div>

      {group && (
        <>
          {filter === 'all' && <GroupStandings matches={group.matches}/>}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredMatches.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--t-3)', fontSize: 13 }}>
                No hay partidos en este filtro.
              </div>
            ) : filteredMatches.map(m => (
              <BracketMatch key={m.id} match={m} prediction={predictions[m.id] ?? null} onTap={onTap}/>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function KnockoutView({
  matches, phaseLabel, predictions, filter, onTap,
}: {
  matches: Match[]
  phaseLabel: string
  predictions: Record<string, Prediction>
  filter: FilterId
  onTap: (m: Match) => void
}) {
  const filtered = matches.filter(m => matchPassesFilter(m, filter, predictions))
  if (matches.length === 0) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <div className="empty">
          <div className="icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="title">{phaseLabel}</div>
          <div className="desc">Los partidos se definirán durante el torneo según los resultados.</div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding: '8px 20px' }}>
      <div style={{ fontSize: 13, color: 'var(--t-3)', marginBottom: 12, fontWeight: 600 }}>
        {phaseLabel}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--t-3)', fontSize: 13 }}>
            No hay partidos en este filtro.
          </div>
        ) : filtered.map(m => (
          <BracketMatch key={m.id} match={m} prediction={predictions[m.id] ?? null} onTap={onTap}/>
        ))}
      </div>
    </div>
  )
}

function FinalView({
  matches, predictions, onTap,
}: {
  matches: Match[]
  predictions: Record<string, Prediction>
  onTap: (m: Match) => void
}) {
  const finalMatch = matches.find(m => m.phase === 'final')
  const thirdMatch = matches.find(m => m.phase === 'third_place')

  return (
    <div style={{ padding: '24px 20px 8px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--gold)' }}>
          <path d="M7 4h10v5a5 5 0 01-10 0V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M9 19h6M12 14v5"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="display" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>Final del Mundial</div>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>19 de julio · MetLife Stadium, Nueva York</div>
      </div>

      <div style={{
        position: 'relative', padding: 20, borderRadius: 20,
        background: 'radial-gradient(circle at 50% 0%, oklch(0.78 0.16 75 / 0.18), transparent 70%), var(--bg-1)',
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        {finalMatch ? (
          <BracketMatch match={finalMatch} prediction={predictions[finalMatch.id] ?? null} onTap={onTap}/>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--t-3)', fontSize: 13, padding: '20px 0' }}>
            El partido final se definirá a lo largo del torneo.
          </div>
        )}
      </div>

      {thirdMatch && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--t-3)', marginBottom: 10, fontWeight: 600 }}>Tercer Puesto</div>
          <BracketMatch match={thirdMatch} prediction={predictions[thirdMatch.id] ?? null} onTap={onTap}/>
        </div>
      )}
    </div>
  )
}

interface BracketViewProps {
  matches: Match[]
  groups: GroupData[]
  predictions: Record<string, Prediction>
}

export default function BracketView({ matches, groups, predictions }: BracketViewProps) {
  const [phaseId, setPhaseId] = useState('grupos')
  const [filter, setFilter] = useState<FilterId>('all')
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const activeMatch = matches.find(m => m.id === activeMatchId) ?? null

  const matchesByPhase = (dbPhase: string) =>
    matches.filter(m => m.phase === dbPhase)

  const phaseCounts: Record<string, number> = {
    grupos: groups.reduce((s, g) => s + g.matches.length, 0),
    '16vos': matchesByPhase('round_of_32').length,
    '8vos': matchesByPhase('round_of_16').length,
    '4tos': matchesByPhase('quarter').length,
    semis: matchesByPhase('semi').length,
    final: matchesByPhase('final').length + matchesByPhase('third_place').length,
  }

  const openModal = (m: Match) => setActiveMatchId(m.id)
  const closeModal = () => setActiveMatchId(null)

  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 12px' }}>
        <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
          Bracket
        </h1>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
          Mundial 2026 · <span className="mono" style={{ color: 'var(--gold)', fontWeight: 600 }}>104 partidos</span>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="tab-strip">
          {PHASES.map(p => (
            <div
              key={p.id}
              className={`tab${phaseId === p.id ? ' active' : ''}`}
              onClick={() => setPhaseId(p.id)}
            >
              {p.label}
              {phaseCounts[p.id] > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 4,
                  background: phaseId === p.id ? 'var(--gold)' : 'var(--bg-3)',
                  color: phaseId === p.id ? 'oklch(0.18 0.04 60)' : 'var(--t-3)',
                  fontWeight: 700,
                }} className="mono">{phaseCounts[p.id]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        padding: '12px 16px 0', display: 'flex', gap: 6,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: 999,
              background: filter === f.id ? 'var(--gold)' : 'var(--bg-2)',
              color: filter === f.id ? 'var(--btn-primary-text)' : 'var(--t-2)',
              border: `0.5px solid ${filter === f.id ? 'var(--gold)' : 'var(--line-soft)'}`,
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {phaseId === 'grupos' && <GruposView groups={groups} predictions={predictions} filter={filter} onTap={openModal}/>}
      {phaseId === '16vos' && <KnockoutView matches={matchesByPhase('round_of_32')} phaseLabel="16avos de Final" predictions={predictions} filter={filter} onTap={openModal}/>}
      {phaseId === '8vos' && <KnockoutView matches={matchesByPhase('round_of_16')} phaseLabel="Octavos de Final" predictions={predictions} filter={filter} onTap={openModal}/>}
      {phaseId === '4tos' && <KnockoutView matches={matchesByPhase('quarter')} phaseLabel="Cuartos de Final" predictions={predictions} filter={filter} onTap={openModal}/>}
      {phaseId === 'semis' && <KnockoutView matches={matchesByPhase('semi')} phaseLabel="Semifinales" predictions={predictions} filter={filter} onTap={openModal}/>}
      {phaseId === 'final' && <FinalView matches={[...matchesByPhase('final'), ...matchesByPhase('third_place')]} predictions={predictions} onTap={openModal}/>}

      <div style={{ height: 16 }}/>

      {activeMatch && (
        <PredictionModal
          match={activeMatch}
          prediction={predictions[activeMatch.id] ?? null}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
