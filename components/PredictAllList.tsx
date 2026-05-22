'use client'

import { useState, useTransition, useRef } from 'react'
import Flag, { COUNTRY } from '@/components/Flag'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import { isKnockout, needsTiebreaker } from '@/lib/types/prediction'
import { upsertPrediction } from '@/app/actions/predictions'

type Filter = 'pending' | 'all'

interface RowState {
  home: string
  away: string
  tieWinner: string | null
  saving: boolean
  saved: boolean
  err: string | null
  dirty: boolean
}

interface Props {
  matches: Match[]
  predictions: Record<string, Prediction>
}

export default function PredictAllList({ matches, predictions }: Props) {
  const [filter, setFilter] = useState<Filter>('pending')
  const [state, setState] = useState<Record<string, RowState>>(() => {
    const o: Record<string, RowState> = {}
    for (const m of matches) {
      const p = predictions[m.id]
      o[m.id] = {
        home: p?.home_score?.toString() ?? '',
        away: p?.away_score?.toString() ?? '',
        tieWinner: p?.tiebreaker_winner_id ?? null,
        saving: false,
        saved: !!p,
        err: null,
        dirty: false,
      }
    }
    return o
  })

  const filtered = matches.filter(m => {
    if (filter === 'all') return true
    return !predictions[m.id] && !state[m.id]?.saved
  })

  const pendingCount = matches.filter(m => !predictions[m.id] && !state[m.id]?.saved).length

  return (
    <>
      {/* Filter chips */}
      <div style={{
        padding: '0 20px 12px', display: 'flex', gap: 8,
      }}>
        {([
          { id: 'pending' as Filter, label: `Sin pronosticar${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { id: 'all' as Filter, label: `Todos (${matches.length})` },
        ]).map(f => (
          <button key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              background: filter === f.id ? 'var(--gold)' : 'var(--bg-2)',
              color: filter === f.id ? 'var(--btn-primary-text)' : 'var(--t-2)',
              border: `0.5px solid ${filter === f.id ? 'var(--gold)' : 'var(--line-soft)'}`,
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t-1)', marginBottom: 4 }}>
            Estás al día
          </div>
          <div style={{ fontSize: 13, color: 'var(--t-3)' }}>
            Pronosticaste todos los partidos disponibles.
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(m => (
          <Row
            key={m.id}
            match={m}
            state={state[m.id]!}
            setState={(s) => setState(prev => ({ ...prev, [m.id]: s }))}
          />
        ))}
      </div>
    </>
  )
}

function Row({ match, state, setState }: {
  match: Match
  state: RowState
  setState: (s: RowState) => void
}) {
  const home = match.home_team as Team | null
  const away = match.away_team as Team | null
  const homeName = home ? (COUNTRY[home.code] ?? home.name) : '?'
  const awayName = away ? (COUNTRY[away.code] ?? away.name) : '?'
  const [pending, start] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ko = isKnockout(match.phase)
  const hNum = state.home === '' ? null : parseInt(state.home, 10)
  const aNum = state.away === '' ? null : parseInt(state.away, 10)
  const tieReq = ko && hNum != null && aNum != null && hNum === aNum

  function trySave(next: RowState) {
    const h = next.home === '' ? null : parseInt(next.home, 10)
    const a = next.away === '' ? null : parseInt(next.away, 10)
    if (h == null || a == null) return  // need both
    if (isNaN(h) || isNaN(a) || h < 0 || h > 20 || a < 0 || a > 20) {
      setState({ ...next, err: '0-20', saving: false })
      return
    }
    if (needsTiebreaker(match, h, a) && !next.tieWinner) {
      setState({ ...next, err: 'Falta desempate', saving: false })
      return
    }
    setState({ ...next, saving: true, saved: false, err: null })
    start(async () => {
      const r = await upsertPrediction({
        matchId: match.id,
        homeScore: h,
        awayScore: a,
        tiebreakerWinnerId: needsTiebreaker(match, h, a) ? next.tieWinner : null,
      })
      if (r.ok) {
        setState({ ...next, saving: false, saved: true, dirty: false, err: null })
      } else {
        setState({ ...next, saving: false, saved: false, err: r.error })
      }
    })
  }

  function adjust(side: 'h' | 'a', delta: number) {
    const cur = side === 'h' ? state.home : state.away
    const v = cur === '' ? 0 : Math.max(0, Math.min(20, parseInt(cur, 10) + delta))
    const next = side === 'h'
      ? { ...state, home: String(v), dirty: true }
      : { ...state, away: String(v), dirty: true }
    setState(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => trySave(next), 500)
  }

  function setTie(uid: string) {
    const next = { ...state, tieWinner: uid, dirty: true }
    setState(next)
    trySave(next)
  }

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: `0.5px solid ${state.saved ? 'var(--gold-deep)' : 'var(--line-soft)'}`,
      borderRadius: 12, padding: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--t-3)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {new Date(match.kickoff_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <StatusDot state={state} pending={pending}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {home && <Flag code={home.code} size={22}/>}
          <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {homeName}
          </span>
        </div>

        {/* Score inputs with +/- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BtnMini onClick={() => adjust('h', -1)} disabled={hNum === null || hNum === 0}>−</BtnMini>
          <Num value={state.home || '–'}/>
          <BtnMini onClick={() => adjust('h', 1)} disabled={hNum === 20}>+</BtnMini>
          <span style={{ color: 'var(--t-4)', margin: '0 2px' }}>:</span>
          <BtnMini onClick={() => adjust('a', -1)} disabled={aNum === null || aNum === 0}>−</BtnMini>
          <Num value={state.away || '–'}/>
          <BtnMini onClick={() => adjust('a', 1)} disabled={aNum === 20}>+</BtnMini>
        </div>

        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {awayName}
          </span>
          {away && <Flag code={away.code} size={22}/>}
        </div>
      </div>

      {/* Tiebreaker */}
      {tieReq && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ color: 'var(--t-3)', fontWeight: 600 }}>Pasa:</span>
          <button
            onClick={() => home && setTie(home.id)}
            style={tieBtn(state.tieWinner === home?.id)}
          >{home ? (COUNTRY[home.code] ?? home.name) : '?'}</button>
          <button
            onClick={() => away && setTie(away.id)}
            style={tieBtn(state.tieWinner === away?.id)}
          >{away ? (COUNTRY[away.code] ?? away.name) : '?'}</button>
        </div>
      )}

      {state.err && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--lose)' }}>{state.err}</div>
      )}
    </div>
  )
}

function BtnMini({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: disabled ? 'var(--bg-3)' : 'var(--gold)',
        color: disabled ? 'var(--t-4)' : 'var(--btn-primary-text)',
        border: 'none', fontSize: 16, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}
    >{children}</button>
  )
}

function Num({ value }: { value: string }) {
  return (
    <span className="mono" style={{
      minWidth: 24, height: 32, lineHeight: '32px', textAlign: 'center',
      fontSize: 18, fontWeight: 700, color: 'var(--t-1)',
    }}>{value}</span>
  )
}

function tieBtn(active: boolean): React.CSSProperties {
  return {
    padding: '4px 10px', borderRadius: 999,
    background: active ? 'var(--pill-gold-bg)' : 'var(--bg-2)',
    border: `0.5px solid ${active ? 'var(--gold-deep)' : 'var(--line-soft)'}`,
    color: active ? 'var(--selected-text)' : 'var(--t-2)',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  }
}

function StatusDot({ state, pending }: { state: RowState; pending: boolean }) {
  if (state.saving || pending) {
    return <span style={{ fontSize: 11, color: 'var(--t-3)' }}>guardando…</span>
  }
  if (state.err) {
    return <span style={{ fontSize: 11, color: 'var(--lose)', fontWeight: 700 }}>⚠</span>
  }
  if (state.saved) {
    return <span style={{ fontSize: 11, color: 'var(--pitch)', fontWeight: 700 }}>✓ guardado</span>
  }
  if (state.dirty) {
    return <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>•</span>
  }
  return <span style={{ fontSize: 11, color: 'var(--t-4)' }}>–</span>
}
