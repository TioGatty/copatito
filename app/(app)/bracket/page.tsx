import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/types/match'

const PHASE_LABELS: Record<string, string> = {
  group:       'Fase de Grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarter:     'Cuartos de Final',
  semi:        'Semifinales',
  third_place: 'Tercer Puesto',
  final:       'Final',
}

const PHASE_ORDER = [
  'group','round_of_32','round_of_16','quarter','semi','third_place','final'
]

function MatchCard({ match }: { match: Match }) {
  const home = match.home_team
  const away = match.away_team
  const homeName = home ? `${home.flag_emoji} ${home.code}` : match.home_placeholder ?? '?'
  const awayName = away ? `${away.flag_emoji} ${away.code}` : match.away_placeholder ?? '?'
  const date = new Date(match.kickoff_at).toLocaleDateString('es', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-2">
      <span className="text-sm font-medium w-20 text-right truncate">{homeName}</span>
      <div className="flex items-center gap-1 text-sm font-bold min-w-[3rem] justify-center">
        {match.status === 'finished' ? (
          <span>{match.home_score} – {match.away_score}</span>
        ) : (
          <span className="text-white/40 text-xs">{date}</span>
        )}
      </div>
      <span className="text-sm font-medium w-20 truncate">{awayName}</span>
    </div>
  )
}

export default async function BracketPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .order('match_number')

  if (error) return <p className="p-6 text-red-400">Error cargando partidos</p>

  const byPhase = (matches as Match[]).reduce<Record<string, Match[]>>((acc, m) => {
    acc[m.phase] = acc[m.phase] ?? []
    acc[m.phase].push(m)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Mundial 2026</h1>
      {PHASE_ORDER.filter(p => byPhase[p]?.length).map(phase => (
        <section key={phase}>
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            {PHASE_LABELS[phase]}
          </h2>
          <div className="space-y-2">
            {byPhase[phase].map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
