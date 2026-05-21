import { createClient } from '@/lib/supabase/server'

export interface RankRow {
  user_id: string
  display_name: string
  avatar_preset: number
  points: number
  predictions: number
  hits: number
  rank: number
}

export interface MyRank {
  rank: number
  points: number
  hits: number
  total_users: number
}

export async function getGlobalRanking(limit = 100): Promise<RankRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_global_ranking', { p_limit: limit })
  if (error) {
    console.error('[getGlobalRanking]', error.message)
    return []
  }
  return (data ?? []) as RankRow[]
}

export async function getMyGlobalRank(): Promise<MyRank | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.rpc('get_my_global_rank')
  if (error) {
    console.error('[getMyGlobalRank]', error.message)
    return null
  }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return row as MyRank
}
