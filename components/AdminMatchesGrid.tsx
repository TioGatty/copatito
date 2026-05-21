'use client'

import { useState, useTransition } from 'react'
import Flag, { COUNTRY } from '@/components/Flag'
import type { Match, Team } from '@/lib/types/match'
import { saveMatchScore, revertMatch } from '@/app/actions/admin-matches'

const PHASES = [
  { id: 'pending',   label: 'Pendientes' },
  { id: 'finished',  label: 'Finalizados' },
  { id: 'group',     label: 'Grupos' },
  { id: 'round_of_32', label: '16vos' },
  { id: 'round_of_16', label: '8vos' },
  { id: 'quarter',   label: '4tos' },
  { id: 'semi',      label: 'Semis' },
  { id: 'final',     label: 'Final' },
] as const

type FilterId = typeof PHASES[number]['id']

type LocalState = Record<string, {
  home: string
  away: string
  status: 'scheduled' | 'live' | 'finished'
  dirty: boolean
  saving: boolean
  err: string | null
}>

export default function AdminMatchesGrid({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<FilterId>('pending')
  const [st, setSt] = useState<LocalState>(() => {
    const o: LocalState = {}
    for (const m of matches) {
      o[m.id] = {
        home: m.home_score?.toString() ?? '',
        away: m.away_score?.toString() ?? '',
        status: m.status,
        dirty: false,
        saving: false,
        err: null,
      }
    }
    return o
  })

  const filtered = matches.filter(m => {
    if (filter === 'pending')  return st[m.id]?.status !== 'finished'
    if (filter === 'finished') return st[m.id]?.status === 'finished'
    return m.phase === filter
  })

  return (
    <div className="space-y-3">
      {/* Phase tabs */}
      <div className="tab-strip" style={{ overflowX: 'auto' }}>
        {PHASES.map(p => (
          <div
            key={p.id}
            className={`tab${filter === p.id ? ' active' : ''}`}
            onClick={() => setFilter(p.id)}
          >
            {p.label}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'oklch(0.7 0.01 60)' }}>
        {filtered.length} partidos · {filter === 'finished' ? 'click Deshacer para revertir' : 'escribí scores y click Confirmar'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'oklch(0.6 0.01 60)', fontSize: 13 }}>
            Sin partidos en esta sección.
          </div>
        )}
        {filtered.map(m => (
          <Row key={m.id} match={m} state={st[m.id]!} setState={(s) => setSt(prev => ({ ...prev, [m.id]: s }))}/>
        ))}
      </div>
    </div>
  )
}

function Row({ match, state, setState }: {
  match: Match
  state: LocalState[string]
  setState: (s: LocalState[string]) => void
}) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : (match.home_placeholder ?? '?')
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : (match.away_placeholder ?? '?')

  const [pending, start] = useTransition()

  function update(field: 'home' | 'away', v: string) {
    const next = { ...state, [field]: v, dirty: true, err: null }
    setState(next)
  }

  function confirm() {
    const h = state.home === '' ? null : parseInt(state.home, 10)
    const a = state.away === '' ? null : parseInt(state.away, 10)
    if (h == null || a == null) {
      setState({ ...state, err: 'Completá ambos scores' })
      return
    }
    if (isNaN(h) || h < 0 || h > 20 || isNaN(a) || a < 0 || a > 20) {
      setState({ ...state, err: 'Score inválido (0–20)' })
      return
    }
    if (!window.confirm(`¿Confirmar ${h}-${a}? Se marcará como finalizado y se calcularán los puntos.`)) return
    setState({ ...state, saving: true, err: null })
    start(async () => {
      const r = await saveMatchScore({ matchId: match.id, homeScore: h, awayScore: a })
      if (r.ok) {
        setState({ ...state, saving: false, dirty: false, status: 'finished' })
      } else {
        setState({ ...state, saving: false, err: r.error })
      }
    })
  }

  function undo() {
    if (!window.confirm('¿Deshacer este resultado? Las predicciones perderán sus puntos.')) return
    setState({ ...state, saving: true, err: null })
    start(async () => {
      const r = await revertMatch(match.id)
      if (r.ok) {
        setState({
          home: '', away: '', status: 'scheduled',
          dirty: false, saving: false, err: null,
        })
      } else {
        setState({ ...state, saving: false, err: r.error })
      }
    })
  }

  const isFinished = state.status === 'finished'
  const isLive = state.status === 'live'

  return (
    <div style={{
      background: isFinished ? 'oklch(0.16 0.02 60 / 0.8)' : 'oklch(0.18 0.02 60 / 0.5)',
      border: `0.5px solid ${isFinished ? 'oklch(0.4 0.1 145 / 0.5)' : 'oklch(0.3 0.01 60)'}`,
      borderRadius: 12, padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'oklch(0.6 0.01 60)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          #{match.match_number} · {match.phase}
        </span>
        <StatusBadge status={state.status} saving={state.saving || pending} dirty={state.dirty}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {home && <Flag code={home.code} size={22}/>}
          <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
            {homeName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={state.home}
            onChange={e => update('home', e.target.value)}
            disabled={state.saving}
            style={inpStyle}
          />
          <span style={{ color: 'oklch(0.5 0.01 60)' }}>:</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={state.away}
            onChange={e => update('away', e.target.value)}
            disabled={state.saving}
            style={inpStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
            {awayName}
          </span>
          {away && <Flag code={away.code} size={22}/>}
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 10, color: 'oklch(0.5 0.01 60)' }}>
        {new Date(match.kickoff_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        {isLive && <span style={{ marginLeft: 8, color: 'oklch(0.65 0.2 25)', fontWeight: 700 }}>EN VIVO</span>}
      </div>

      {state.err && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'oklch(0.65 0.18 25)' }}>
          {state.err}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        {!isFinished && (
          <button
            onClick={confirm}
            disabled={pending || state.saving || !state.dirty}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: (state.dirty && !state.saving) ? 'oklch(0.7 0.16 145)' : 'oklch(0.25 0.02 60)',
              color: (state.dirty && !state.saving) ? 'oklch(0.15 0.05 145)' : 'oklch(0.5 0.01 60)',
              border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              cursor: (state.dirty && !state.saving) ? 'pointer' : 'not-allowed',
            }}
          >
            {state.saving ? 'Guardando…' : 'Confirmar resultado'}
          </button>
        )}
        {isFinished && (
          <button
            onClick={undo}
            disabled={pending || state.saving}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: 'oklch(0.3 0.1 25 / 0.4)',
              border: '0.5px solid oklch(0.4 0.12 25)',
              color: 'oklch(0.7 0.18 25)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {state.saving ? 'Revirtiendo…' : 'Deshacer resultado'}
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status, saving, dirty }: { status: string; saving: boolean; dirty: boolean }) {
  if (saving) return <Pill text="Guardando…" color="oklch(0.7 0.01 60)" bg="oklch(0.25 0.01 60)"/>
  if (dirty) return <Pill text="Sin guardar" color="oklch(0.7 0.12 75)" bg="oklch(0.25 0.05 75)"/>
  if (status === 'finished') return <Pill text="Finalizado" color="oklch(0.7 0.15 145)" bg="oklch(0.25 0.06 145)"/>
  if (status === 'live') return <Pill text="En vivo" color="oklch(0.7 0.18 25)" bg="oklch(0.25 0.08 25)"/>
  return <Pill text="Pendiente" color="oklch(0.6 0.01 60)" bg="oklch(0.22 0.01 60)"/>
}

function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 999,
      background: bg, color, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{text}</span>
  )
}

const inpStyle: React.CSSProperties = {
  width: 42, height: 36, padding: 0,
  background: 'oklch(0.22 0.01 60)',
  border: '0.5px solid oklch(0.32 0.01 60)',
  borderRadius: 8,
  color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 16,
  fontFamily: 'var(--font-jetbrains, monospace)',
  outline: 'none',
}
