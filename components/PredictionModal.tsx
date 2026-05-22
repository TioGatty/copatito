'use client'

import { useEffect, useState, useTransition } from 'react'
import Flag, { COUNTRY } from '@/components/Flag'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import { getPredictionState, isKnockout, needsTiebreaker, phaseMultiplier } from '@/lib/types/prediction'
import { upsertPrediction } from '@/app/actions/predictions'
import Confetti from '@/components/Confetti'
import { playChime, playSave, playError, playClick } from '@/lib/sound'

interface Props {
  match: Match
  prediction: Prediction | null
  onClose: () => void
}

const PHASE_LABEL: Record<string, string> = {
  group: 'Fase de grupos',
  round_of_32: '16avos de final',
  round_of_16: 'Octavos',
  quarter: 'Cuartos',
  semi: 'Semifinal',
  third_place: 'Tercer puesto',
  final: 'Final',
}

function teamName(t: Team | null | undefined, fallback: string | null | undefined): string {
  if (!t) return fallback ?? '?'
  return COUNTRY[t.code] ?? t.name
}

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const target = new Date(targetIso).getTime()
  const lockAt = target - 15 * 60 * 1000
  const diff = lockAt - now
  return { lockAt, diff }
}

export default function PredictionModal({ match, prediction, onClose }: Props) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null

  const [hScore, setHScore] = useState<number>(prediction?.home_score ?? 0)
  const [aScore, setAScore] = useState<number>(prediction?.away_score ?? 0)
  const [tieWinner, setTieWinner] = useState<string | null>(prediction?.tiebreaker_winner_id ?? null)
  const [err, setErr] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [pending, start] = useTransition()

  const state = getPredictionState(match)
  const isOpen = state === 'open'
  const tied = hScore === aScore
  const needsTie = needsTiebreaker(match, hScore, aScore)
  const ko = isKnockout(match.phase)
  const { diff } = useCountdown(match.kickoff_at)

  const lockLabel = diff > 0
    ? formatDuration(diff)
    : 'Cerrado'

  function adjust(side: 'h' | 'a', delta: number) {
    if (!isOpen) return
    playClick()
    if (side === 'h') setHScore(v => Math.max(0, Math.min(20, v + delta)))
    else setAScore(v => Math.max(0, Math.min(20, v + delta)))
  }

  function submit() {
    setErr(null)
    if (needsTie && !tieWinner) {
      setErr('Elegí quién avanza si hay empate')
      return
    }
    start(async () => {
      const res = await upsertPrediction({
        matchId: match.id,
        homeScore: hScore,
        awayScore: aScore,
        tiebreakerWinnerId: needsTie ? tieWinner : null,
      })
      if (!res.ok) { playError(); setErr(translateError(res.error)) }
      else { playSave(); onClose() }
    })
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Confetti trigger: finished + user predicted exact score, once per match
  useEffect(() => {
    if (match.status !== 'finished') return
    if (!prediction) return
    if (match.home_score !== prediction.home_score) return
    if (match.away_score !== prediction.away_score) return
    const key = `confetti-${match.id}`
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
    } catch {}
    setShowConfetti(true)
    playChime()
  }, [match.id, match.status, match.home_score, match.away_score, prediction])

  const mult = phaseMultiplier(match.phase)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'oklch(0 0 0 / 0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-1)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 -10px 40px oklch(0 0 0 / 0.5)',
          animation: 'slideUp 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'var(--line)', margin: '0 auto 12px',
        }}/>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {PHASE_LABEL[match.phase] ?? match.phase}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--t-3)', marginTop: 2 }}>
              {new Date(match.kickoff_at).toLocaleString('es', {
                weekday: 'short', day: '2-digit', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'var(--bg-3)', border: 'none', borderRadius: 999,
              width: 32, height: 32, color: 'var(--t-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Teams + score inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <TeamScoreColumn
            team={home}
            fallback={match.home_placeholder}
            score={hScore}
            onAdjust={d => adjust('h', d)}
            disabled={!isOpen}
          />
          <TeamScoreColumn
            team={away}
            fallback={match.away_placeholder}
            score={aScore}
            onAdjust={d => adjust('a', d)}
            disabled={!isOpen}
          />
        </div>

        {/* Tiebreaker */}
        {ko && tied && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 8 }}>
              ¿Quién avanza si hay empate?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <TieButton
                team={home}
                fallback={match.home_placeholder}
                selected={tieWinner === home?.id}
                onClick={() => isOpen && home && setTieWinner(home.id)}
                disabled={!isOpen}
              />
              <TieButton
                team={away}
                fallback={match.away_placeholder}
                selected={tieWinner === away?.id}
                onClick={() => isOpen && away && setTieWinner(away.id)}
                disabled={!isOpen}
              />
            </div>
          </div>
        )}

        {/* Scoring info */}
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'var(--bg-2)', border: '0.5px solid var(--line-soft)',
          marginBottom: 14, fontSize: 12, color: 'var(--t-3)',
          lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--t-2)', marginBottom: 4 }}>
            Cómo se puntúa
          </div>
          <div>10 pts score exacto · 6 pts diferencia · 3 pts ganador</div>
          {mult !== 1 && (
            <div style={{ marginTop: 4 }}>
              Multiplicador de fase: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>x{mult}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 10,
          background: isOpen ? 'oklch(0.3 0.05 145 / 0.3)' : 'oklch(0.3 0.05 25 / 0.3)',
          marginBottom: 12, fontSize: 12,
        }}>
          <span style={{ color: isOpen ? 'var(--pitch)' : 'var(--lose)', fontWeight: 600 }}>
            {state === 'finished' ? 'Partido terminado'
              : state === 'locked' ? 'Edición cerrada'
              : 'Cierra en'}
          </span>
          {isOpen && (
            <span className="mono" style={{ fontWeight: 700, color: 'var(--t-1)' }}>{lockLabel}</span>
          )}
          {state === 'finished' && prediction?.points != null && (
            <span className="mono" style={{ fontWeight: 700, color: 'var(--gold)' }}>+{prediction.points} pts</span>
          )}
        </div>

        {err && (
          <div style={{
            padding: 10, borderRadius: 10,
            background: 'oklch(0.3 0.1 25 / 0.3)',
            color: 'var(--lose)', fontSize: 13, marginBottom: 12,
          }}>{err}</div>
        )}

        {/* CTA */}
        <button
          onClick={submit}
          disabled={!isOpen || pending}
          style={{
            width: '100%', height: 52,
            background: isOpen ? 'var(--gold)' : 'var(--bg-3)',
            color: isOpen ? 'var(--btn-primary-text)' : 'var(--t-4)',
            border: 'none', borderRadius: 14,
            fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
            cursor: isOpen && !pending ? 'pointer' : 'not-allowed',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {pending ? 'Guardando…' : prediction ? 'Actualizar pronóstico' : 'Guardar pronóstico'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
      <Confetti trigger={showConfetti} onDone={() => setShowConfetti(false)}/>
    </div>
  )
}

function TeamScoreColumn({
  team, fallback, score, onAdjust, disabled,
}: {
  team: Team | null
  fallback: string | null | undefined
  score: number
  onAdjust: (delta: number) => void
  disabled: boolean
}) {
  const label = teamName(team, fallback)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '14px 8px', borderRadius: 14,
      background: 'var(--bg-2)', border: '0.5px solid var(--line-soft)',
    }}>
      {team ? <Flag code={team.code} size={56}/> : (
        <div style={{ width: 56*1.5, height: 56, borderRadius: 6, background: 'var(--bg-3)' }}/>
      )}
      <div style={{
        fontSize: 13, fontWeight: 700, textAlign: 'center',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        width: '100%',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ScoreBtn onClick={() => onAdjust(-1)} disabled={disabled || score === 0}>−</ScoreBtn>
        <div className="mono tick" key={score} style={{
          minWidth: 44, height: 44, lineHeight: '44px', textAlign: 'center',
          fontSize: 28, fontWeight: 700, color: 'var(--t-1)',
        }}>{score}</div>
        <ScoreBtn onClick={() => onAdjust(1)} disabled={disabled || score === 20}>+</ScoreBtn>
      </div>
    </div>
  )
}

function ScoreBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 44, height: 44, borderRadius: 12,
        background: disabled ? 'var(--bg-3)' : 'var(--gold)',
        color: disabled ? 'var(--t-4)' : 'var(--btn-primary-text)',
        border: 'none', fontSize: 22, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}
    >{children}</button>
  )
}

function TieButton({
  team, fallback, selected, onClick, disabled,
}: {
  team: Team | null
  fallback: string | null | undefined
  selected: boolean
  onClick: () => void
  disabled: boolean
}) {
  const label = teamName(team, fallback)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 12,
        background: selected ? 'var(--pill-gold-bg)' : 'var(--bg-2)',
        border: `0.5px solid ${selected ? 'var(--gold-deep)' : 'var(--line-soft)'}`,
        color: selected ? 'var(--gold)' : 'var(--t-1)',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 48,
      }}
    >
      {team && <Flag code={team.code} size={24}/>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function translateError(code: string): string {
  switch (code) {
    case 'no_auth': return 'Sesión expirada. Recargá la página.'
    case 'window_closed': return 'Ventana de pronóstico cerrada.'
    case 'tiebreaker_required': return 'Elegí quién avanza en caso de empate.'
    case 'tiebreaker_invalid': return 'Equipo inválido para desempate.'
    case 'teams_not_set': return 'Equipos aún por definir.'
    case 'match_not_found': return 'Partido no encontrado.'
    default: return code
  }
}
