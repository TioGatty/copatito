export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Match, Team } from '@/lib/types/match'
import type { Prediction } from '@/lib/types/prediction'
import BracketView from '@/components/BracketView'
import { getUserPredictions } from '@/lib/predictions/fetch'

export default async function BracketPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .order('match_number')

  if (error) {
    return (
      <div className="screen-body" style={{ padding: '40px 20px' }}>
        <p style={{ color: 'var(--lose)' }}>Error cargando partidos: {error.message}</p>
      </div>
    )
  }

  const allMatches = (matches ?? []) as Match[]

  // ─── Build groups structure ─────────────────────────────────
  // Group matches by their group name (derived from team.group_id)
  // We need group names — collect unique group IDs from teams
  const groupMatchesMap = new Map<string, Match[]>()

  for (const m of allMatches) {
    if (m.phase !== 'group') continue
    const team = (m.home_team ?? m.away_team) as Team | null
    if (!team?.group_id) continue

    // Group name will be fetched separately; use group_id as key temporarily
    if (!groupMatchesMap.has(team.group_id)) {
      groupMatchesMap.set(team.group_id, [])
    }
    groupMatchesMap.get(team.group_id)!.push(m)
  }

  // Fetch group names
  const { data: groupRows } = await supabase
    .from('groups')
    .select('id, name')
    .order('name')

  const groupIdToName = new Map((groupRows ?? []).map(g => [g.id, g.name]))

  const groups = Array.from(groupMatchesMap.entries())
    .map(([groupId, groupMatches]) => ({
      name: groupIdToName.get(groupId) ?? groupId,
      matches: groupMatches.sort((a, b) => a.match_number - b.match_number),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const predictionsMap = await getUserPredictions(allMatches.map(m => m.id))
  const predictions: Record<string, Prediction> = {}
  for (const [k, v] of predictionsMap) predictions[k] = v

  return <BracketView matches={allMatches} groups={groups} predictions={predictions}/>
}
