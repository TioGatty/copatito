import { createClient } from '@/lib/supabase/server'
import type { Prediction } from '@/lib/types/prediction'

export async function getUserPredictions(matchIds?: string[]): Promise<Map<string, Prediction>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Map()

  let q = supabase.from('predictions').select('*').eq('user_id', user.id)
  if (matchIds && matchIds.length > 0) q = q.in('match_id', matchIds)

  const { data } = await q
  const m = new Map<string, Prediction>()
  for (const p of (data ?? []) as Prediction[]) m.set(p.match_id, p)
  return m
}

export async function getAllUserPredictionsWithMatch() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('predictions')
    .select('*, match:match_id(*, home_team:home_team_id(*), away_team:away_team_id(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getUserTotalPoints(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { data } = await supabase
    .from('predictions')
    .select('points')
    .eq('user_id', user.id)
    .not('points', 'is', null)
  return (data ?? []).reduce((sum, r: { points: number | null }) => sum + (r.points ?? 0), 0)
}
