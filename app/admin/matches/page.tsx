import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Match } from '@/lib/types/match'

async function saveScore(formData: FormData) {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { createAdminClient } = await import('@/lib/supabase/admin')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return

  const matchId = formData.get('matchId') as string
  if (!matchId || !/^[0-9a-f-]{36}$/.test(matchId)) return

  const homeScore = parseInt(formData.get('homeScore') as string)
  const awayScore = parseInt(formData.get('awayScore') as string)
  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
    .eq('id', matchId)

  if (error) throw new Error(`Failed to save score: ${error.message}`)

  revalidatePath('/admin/matches')
  revalidatePath('/bracket')
}

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .gte('kickoff_at', today.toISOString())
    .lt('kickoff_at', tomorrow.toISOString())
    .order('kickoff_at')

  const all = (matches ?? []) as Match[]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Cargar Resultados</h1>
      <p className="text-white/50 text-sm">Partidos de hoy</p>

      {all.length === 0 && (
        <p className="text-white/40 text-sm">No hay partidos programados para hoy.</p>
      )}

      {all.map(match => {
        const home = match.home_team
        const away = match.away_team
        const homeName = home ? `${home.flag_emoji} ${home.name}` : match.home_placeholder ?? '?'
        const awayName = away ? `${away.flag_emoji} ${away.name}` : match.away_placeholder ?? '?'

        return (
          <form key={match.id} action={saveScore}
            className="bg-white/5 rounded-xl p-4 space-y-3">
            <input type="hidden" name="matchId" value={match.id} />
            <div className="text-sm text-white/60">Partido #{match.match_number}</div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-right text-sm font-medium">{homeName}</span>
              <input
                type="number" name="homeScore" min="0" max="20"
                defaultValue={match.home_score ?? ''}
                className="w-12 text-center bg-white/10 rounded-lg p-2 text-sm"
              />
              <span className="text-white/40">–</span>
              <input
                type="number" name="awayScore" min="0" max="20"
                defaultValue={match.away_score ?? ''}
                className="w-12 text-center bg-white/10 rounded-lg p-2 text-sm"
              />
              <span className="flex-1 text-sm font-medium">{awayName}</span>
            </div>
            <button type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
                         rounded-lg py-2 text-sm transition-colors">
              Guardar resultado
            </button>
          </form>
        )
      })}
    </div>
  )
}
