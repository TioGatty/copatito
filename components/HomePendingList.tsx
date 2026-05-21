'use client'

import { useState } from 'react'
import Link from 'next/link'
import Flag, { COUNTRY } from '@/components/Flag'
import PredictionModal from '@/components/PredictionModal'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import { getPredictionState } from '@/lib/types/prediction'

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.7"/>
    </svg>
  )
}

const PHASE_LABEL: Record<string, string> = {
  group: 'FASE DE GRUPOS',
  round_of_32: '16AVOS DE FINAL',
  round_of_16: 'OCTAVOS',
  quarter: 'CUARTOS',
  semi: 'SEMIFINAL',
  final: 'FINAL',
  third_place: '3ER PUESTO',
}

function PendingCard({
  match, prediction, onTap,
}: {
  match: Match
  prediction: Prediction | null
  onTap: (m: Match) => void
}) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (match.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (match.away_placeholder ?? '?')

  const kickoff = new Date(match.kickoff_at)
  const now = new Date()
  const diffMs = kickoff.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffM = Math.floor((diffMs % 3600000) / 60000)

  const timeLabel = diffMs < 0
    ? 'Ya comenzó'
    : diffH > 24
      ? kickoff.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : diffH > 0
        ? `Cierra en ${diffH}h ${diffM}m`
        : `Cierra en ${diffM}m`

  const teamsKnown = !!home && !!away
  const state = getPredictionState(match)
  const tappable = teamsKnown && state === 'open'
  const ctaLabel = prediction ? 'Editar' : 'Pronosticar'

  return (
    <button
      onClick={() => tappable && onTap(match)}
      disabled={!tappable}
      className="card"
      style={{
        padding: 16, position: 'relative', overflow: 'hidden',
        width: '100%', textAlign: 'left', fontFamily: 'inherit', color: 'inherit',
        cursor: tappable ? 'pointer' : 'default',
        border: prediction ? '0.5px solid var(--gold-deep)' : undefined,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: 'radial-gradient(circle at top right, oklch(0.82 0.16 80 / 0.1), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: 'var(--t-3)', fontWeight: 600 }}>
          {PHASE_LABEL[match.phase] ?? match.phase.toUpperCase()}
        </span>
        <div className="mono" style={{ fontSize: 11, color: 'var(--t-3)', fontWeight: 600 }}>
          {kickoff.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="match">
        <div className="match-team">
          {home ? <Flag code={home.code} size={40}/> : (
            <div style={{ width: 60, height: 40, borderRadius: 6, background: 'var(--bg-3)', flexShrink: 0 }}/>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {homeName}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={`score-input${prediction ? ' set' : ''}`} style={{ fontSize: 17 }}>
            {prediction ? prediction.home_score : '–'}
          </div>
          <span style={{ color: 'var(--t-4)', fontWeight: 700 }}>:</span>
          <div className={`score-input${prediction ? ' set' : ''}`} style={{ fontSize: 17 }}>
            {prediction ? prediction.away_score : '–'}
          </div>
        </div>
        <div className="match-team away">
          {away ? <Flag code={away.code} size={40}/> : (
            <div style={{ width: 60, height: 40, borderRadius: 6, background: 'var(--bg-3)', flexShrink: 0 }}/>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {awayName}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--line-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t-3)' }}>
          <LockIcon/>
          <span>{timeLabel}</span>
        </div>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
            background: tappable ? 'var(--gold)' : 'var(--bg-3)',
            color: tappable ? 'var(--btn-primary-text)' : 'var(--t-4)',
            borderRadius: 12, fontSize: 13, fontWeight: 700,
          }}
        >
          {state === 'open' ? ctaLabel : 'Cerrado'}
        </span>
      </div>
    </button>
  )
}

interface Props {
  upcoming: Match[]
  predictions: Record<string, Prediction>
}

export default function HomePendingList({ upcoming, predictions }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = upcoming.find(m => m.id === activeId) ?? null

  if (upcoming.length === 0) {
    return (
      <div className="empty">
        <div className="icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="title">Sin partidos próximos</div>
        <div className="desc">Volvé pronto. Cuando arranque el Mundial vas a ver los partidos acá.</div>
      </div>
    )
  }

  return (
    <>
      {upcoming.map(m => (
        <PendingCard
          key={m.id}
          match={m}
          prediction={predictions[m.id] ?? null}
          onTap={x => setActiveId(x.id)}
        />
      ))}
      {active && (
        <PredictionModal
          match={active}
          prediction={predictions[active.id] ?? null}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  )
}
