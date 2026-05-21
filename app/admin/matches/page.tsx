export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/types/match'
import AdminMatchesGrid from '@/components/AdminMatchesGrid'

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .order('match_number')

  const all = (matches ?? []) as Match[]

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Cargar resultados</h1>
      <AdminMatchesGrid matches={all}/>
    </div>
  )
}
