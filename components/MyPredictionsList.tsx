'use client'

import { useState } from 'react'
import Flag, { COUNTRY } from '@/components/Flag'
import PredictionModal from '@/components/PredictionModal'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import { getPredictionState } from '@/lib/types/prediction'

export interface PredictionWithMatch extends Prediction {
  match: Match & { home_team: Team | null; away_team: Team | null }
}

const PHASE_LABEL: Record<string, string> = {
  group: 'Grupos',
  round_of_32: '16avos',
  round_of_16: 'Octavos',
  quarter: 'Cuartos',
  semi: 'Semis',
  third_place: '3er puesto',
  final: 'Final',
}

function Row({ p, onTap }: { p: PredictionWithMatch; onTap: (m: Match) => void }) {
  const m = p.match
  const home = m.home_team
  const away = m.away_team
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (m.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (m.away_placeholder ?? '?')

  const isFinished = m.status === 'finished'
  const state = getPredictionState(m)
  const tappable = !!home && !!away && (state === 'open' || isFinished)

  let pointsBadge = null
  if (isFinished && p.points != null) {
    pointsBadge = (
      <span className="mono" style={{
        fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        background: p.points > 0 ? 'oklch(0.3 0.1 145 / 0.5)' : 'oklch(0.3 0.05 25 / 0.4)',
        color: p.points > 0 ? 'var(--pitch)' : 'var(--lose)',
      }}>+{p.points}</span>
    )
  } else if (state === 'open') {
    pointsBadge = (
      <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>Pendiente</span>
    )
  } else {
    pointsBadge = (
      <span style={{ fontSize: 11, color: 'var(--t-3)', fontWeight: 600 }}>Cerrado</span>
    )
  }

  return (
    <button
      onClick={() => tappable && onTap(m)}
      disabled={!tappable}
      style={{
        background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
        borderRadius: 12, padding: 12, width: '100%', textAlign: 'left',
        fontFamily: 'inherit', color: 'inherit',
        cursor: tappable ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--t-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {PHASE_LABEL[m.phase] ?? m.phase}
        </span>
        {pointsBadge}
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
    </button>
  )
}

export default function MyPredictionsList({ predictions }: { predictions: PredictionWithMatch[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = predictions.find(p => p.match.id === activeId)

  if (predictions.length === 0) {
    return (
      <div className="empty">
        <div className="icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M9 11l3 3L20 6M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="title">Sin pronósticos todavía</div>
        <div className="desc">Andá al bracket y pronosticá el resultado de los próximos partidos.</div>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {predictions.map(p => (
          <Row key={p.id} p={p} onTap={m => setActiveId(m.id)}/>
        ))}
      </div>
      {active && (
        <PredictionModal
          match={active.match}
          prediction={active}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  )
}
