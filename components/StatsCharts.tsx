import type { PredictionWithMatch } from '@/components/MyPredictionsList'

interface Props {
  predictions: PredictionWithMatch[]
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Grupos',
  round_of_32: '16vos',
  round_of_16: '8vos',
  quarter: '4tos',
  semi: 'Semis',
  third_place: '3°',
  final: 'Final',
}
const PHASE_ORDER = ['group','round_of_32','round_of_16','quarter','semi','third_place','final']

function classify(p: PredictionWithMatch): 'exact' | 'diff' | 'winner' | 'miss' | 'pending' {
  const m = p.match
  if (!m || m.status !== 'finished' || m.home_score == null || m.away_score == null) return 'pending'
  if (p.points == null) return 'pending'
  if (p.home_score === m.home_score && p.away_score === m.away_score) return 'exact'
  const pDiff = p.home_score - p.away_score
  const rDiff = m.home_score - m.away_score
  if (pDiff === rDiff) return 'diff'
  if (Math.sign(pDiff) === Math.sign(rDiff)) return 'winner'
  return 'miss'
}

export default function StatsCharts({ predictions }: Props) {
  const finished = predictions.filter(p => p.match?.status === 'finished' && p.points != null)
  if (finished.length === 0) return null

  // Distribution
  const dist = { exact: 0, diff: 0, winner: 0, miss: 0 }
  for (const p of finished) {
    const c = classify(p)
    if (c === 'exact') dist.exact++
    else if (c === 'diff') dist.diff++
    else if (c === 'winner') dist.winner++
    else if (c === 'miss') dist.miss++
  }
  const total = dist.exact + dist.diff + dist.winner + dist.miss

  // Cumulative points sparkline
  const sorted = [...finished].sort((a, b) =>
    new Date(a.match.kickoff_at).getTime() - new Date(b.match.kickoff_at).getTime()
  )
  let acc = 0
  const cum = sorted.map(p => { acc += p.points ?? 0; return acc })
  const maxCum = Math.max(1, ...cum)

  // Per phase
  const byPhase: Record<string, { hits: number; total: number }> = {}
  for (const p of finished) {
    const ph = p.match.phase
    if (!byPhase[ph]) byPhase[ph] = { hits: 0, total: 0 }
    byPhase[ph].total++
    if ((p.points ?? 0) > 0) byPhase[ph].hits++
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Distribution stacked bar */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 10 }}>
          Distribución de aciertos
        </div>
        <div style={{
          display: 'flex', width: '100%', height: 14, borderRadius: 7,
          overflow: 'hidden', background: 'var(--bg-3)', marginBottom: 12,
        }}>
          {([
            { v: dist.exact,  color: 'var(--gold)' },
            { v: dist.diff,   color: 'var(--pitch)' },
            { v: dist.winner, color: 'var(--sky)' },
            { v: dist.miss,   color: 'var(--lose)' },
          ]).map((s, i) => s.v > 0 ? (
            <div key={i} style={{
              width: `${(s.v / total) * 100}%`,
              background: s.color, height: '100%',
            }}/>
          ) : null)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12 }}>
          <LegendRow color="var(--gold)"   label="Score exacto" v={dist.exact}  pct={total ? (dist.exact / total) * 100 : 0}/>
          <LegendRow color="var(--pitch)"  label="Diferencia"   v={dist.diff}   pct={total ? (dist.diff / total) * 100 : 0}/>
          <LegendRow color="var(--sky)"    label="Ganador"      v={dist.winner} pct={total ? (dist.winner / total) * 100 : 0}/>
          <LegendRow color="var(--lose)"   label="Falló"        v={dist.miss}   pct={total ? (dist.miss / total) * 100 : 0}/>
        </div>
      </div>

      {/* Sparkline cumulative points */}
      {cum.length > 1 && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Evolución de puntos
            </div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
              {acc}
            </div>
          </div>
          <Sparkline values={cum} max={maxCum}/>
        </div>
      )}

      {/* Per phase */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 12 }}>
          Por fase
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PHASE_ORDER.filter(ph => byPhase[ph]).map(ph => {
            const { hits, total: t } = byPhase[ph]
            const rate = t > 0 ? (hits / t) * 100 : 0
            return (
              <div key={ph} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 40px', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--t-2)', fontWeight: 600 }}>
                  {PHASE_LABELS[ph] ?? ph}
                </span>
                <div style={{
                  height: 8, borderRadius: 4, background: 'var(--bg-3)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${rate}%`, height: '100%',
                    background: 'var(--gold)',
                  }}/>
                </div>
                <span className="mono" style={{ fontSize: 12, color: 'var(--t-2)', textAlign: 'right' }}>
                  {hits}/{t}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LegendRow({ color, label, v, pct }: { color: string; label: string; v: number; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }}/>
      <span style={{ color: 'var(--t-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span className="mono" style={{ color: 'var(--t-3)', fontSize: 11 }}>
        {v} <span style={{ opacity: 0.6 }}>({Math.round(pct)}%)</span>
      </span>
    </div>
  )
}

function Sparkline({ values, max }: { values: number[]; max: number }) {
  const W = 320
  const H = 60
  const n = values.length
  const step = n > 1 ? W / (n - 1) : 0
  const pts = values.map((v, i) => `${i * step},${H - (v / max) * (H - 4) - 2}`).join(' ')
  const areaPts = `0,${H} ${pts} ${W},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--gold)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill="url(#sparkfill)"/>
      <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}
