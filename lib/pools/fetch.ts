import { createClient } from '@/lib/supabase/server'
import type { Pool, PoolWithMeta, PoolRankingEntry, CoinTransaction } from '@/lib/types/pool'

export async function getCoinBalance(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { data, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .maybeSingle()
  if (error) {
    console.error('[getCoinBalance] error:', error.message, 'user:', user.id)
    return 0
  }
  if (!data) {
    console.warn('[getCoinBalance] no profile row for user:', user.id)
    return 0
  }
  return (data.coins as number | null) ?? 0
}

export async function getCoinHistory(limit = 20): Promise<CoinTransaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as CoinTransaction[]
}

export async function getUserPools(): Promise<PoolWithMeta[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // pools where I'm member
  const { data: memberships } = await supabase
    .from('pool_members')
    .select('pool_id')
    .eq('user_id', user.id)
  const poolIds = (memberships ?? []).map(r => r.pool_id as string)
  if (poolIds.length === 0) return []

  const { data: pools } = await supabase
    .from('pools')
    .select('*')
    .in('id', poolIds)
    .order('created_at', { ascending: false })

  // Count members per pool
  const counts: Record<string, number> = {}
  const { data: allMembers } = await supabase
    .from('pool_members')
    .select('pool_id')
    .in('pool_id', poolIds)
  for (const m of (allMembers ?? [])) {
    counts[m.pool_id as string] = (counts[m.pool_id as string] ?? 0) + 1
  }

  return (pools ?? []).map(p => ({
    ...(p as Pool),
    member_count: counts[p.id] ?? 0,
    is_creator: p.creator_id === user.id,
  }))
}

export async function getPoolDetail(poolId: string): Promise<{ pool: Pool; ranking: PoolRankingEntry[] } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { console.warn('[getPoolDetail] no user'); return null }

  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .select('*')
    .eq('id', poolId)
    .maybeSingle<Pool>()
  if (poolErr) { console.error('[getPoolDetail] pool error', poolErr.message, 'id:', poolId); return null }
  if (!pool) { console.warn('[getPoolDetail] no pool for id:', poolId, 'user:', user.id); return null }

  const { data: members } = await supabase
    .from('pool_members')
    .select('user_id')
    .eq('pool_id', poolId)
  const memberIds = (members ?? []).map(m => m.user_id as string)
  if (memberIds.length === 0) return { pool, ranking: [] }

  // Profiles for display
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_preset')
    .in('id', memberIds)
  const profileById = new Map<string, { name: string; preset: number }>()
  for (const p of (profiles ?? [])) {
    profileById.set(p.id as string, {
      name: (p.display_name as string | null) ?? 'Jugador',
      preset: (p.avatar_preset as number | null) ?? 0,
    })
  }

  // Predictions points aggregated per user — fetch and reduce client side (small N)
  const { data: preds } = await supabase
    .from('predictions')
    .select('user_id, points')
    .in('user_id', memberIds)

  const agg: Record<string, { points: number; predictions: number; hits: number }> = {}
  for (const uid of memberIds) agg[uid] = { points: 0, predictions: 0, hits: 0 }
  for (const p of (preds ?? [])) {
    const uid = p.user_id as string
    const pts = p.points as number | null
    if (!agg[uid]) agg[uid] = { points: 0, predictions: 0, hits: 0 }
    agg[uid].predictions++
    if (pts != null) {
      agg[uid].points += pts
      if (pts > 0) agg[uid].hits++
    }
  }

  const ranking: PoolRankingEntry[] = memberIds.map(uid => {
    const p = profileById.get(uid) ?? { name: 'Jugador', preset: 0 }
    const initials = p.name.slice(0, 2).toUpperCase()
    return {
      user_id: uid,
      display_name: p.name,
      initials,
      avatar_preset: p.preset,
      points: agg[uid].points,
      predictions: agg[uid].predictions,
      hits: agg[uid].hits,
      is_me: uid === user.id,
    }
  }).sort((a, b) => b.points - a.points || b.hits - a.hits)

  return { pool, ranking }
}
