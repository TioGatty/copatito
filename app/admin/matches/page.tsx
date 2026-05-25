export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/types/match'
import AdminMatchesGrid from '@/components/AdminMatchesGrid'
import Link from 'next/link'

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .order('match_number')

  const all = (matches ?? []) as Match[]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cargar resultados</h1>
        <Link href="/admin/stats" className="text-xs text-yellow-400 underline">
          → Dashboard
        </Link>
      </div>
      <AdminMatchesGrid matches={all}/>
    </div>
  )
}
