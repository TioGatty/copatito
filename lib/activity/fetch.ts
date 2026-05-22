import { createClient } from '@/lib/supabase/server'
import { ACH_BY_CODE } from '@/lib/achievements/catalog'

export type ActivityItem =
  | { kind: 'prediction_hit';   at: string; matchId: string; teams: string; points: number }
  | { kind: 'prediction_exact'; at: string; matchId: string; teams: string }
  | { kind: 'achievement';      at: string; code: string; title: string; icon: string }
  | { kind: 'pool_create';      at: string; poolName: string; poolId: string }
  | { kind: 'pool_join';        at: string; poolName: string; poolId: string }
  | { kind: 'referral';         at: string; amount: number }

export async function getUserActivity(limit = 12): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const out: ActivityItem[] = []

  // Coin transactions: hits + exact + create_pool + referral
  const { data: txs } = await supabase
    .from('coin_transactions')
    .select('amount, reason, ref_id, created_at')
    .eq('user_id', user.id)
    .in('reason', ['prediction_hit','prediction_exact','create_pool','referral_bonus'])
    .order('created_at', { ascending: false })
    .limit(limit * 2)

  // Map prediction_hit/exact to predictions → match teams
  const predIds = (txs ?? [])
    .filter(t => t.reason === 'prediction_hit' || t.reason === 'prediction_exact')
    .map(t => t.ref_id as string).filter(Boolean)
  const { data: preds } = predIds.length > 0
    ? await supabase
        .from('predictions')
        .select('id, match_id, points, match:match_id(home_team:home_team_id(code), away_team:away_team_id(code))')
        .in('id', predIds)
    : { data: null }
  const predById = new Map((preds ?? []).map(p => [p.id as string, p as unknown as { id: string; match_id: string; points: number | null; match: { home_team: { code: string } | null; away_team: { code: string } | null } | null }]))

  // pool create: ref_id → pool name
  const poolIds = (txs ?? [])
    .filter(t => t.reason === 'create_pool')
    .map(t => t.ref_id as string).filter(Boolean)
  const { data: pools } = poolIds.length > 0
    ? await supabase.from('pools').select('id, name').in('id', poolIds)
    : { data: null }
  const poolById = new Map((pools ?? []).map(p => [p.id as string, p.name as string]))

  for (const t of (txs ?? [])) {
    const ts = t.created_at as string
    if (t.reason === 'prediction_hit' || t.reason === 'prediction_exact') {
      const p = predById.get(t.ref_id as string)
      if (!p) continue
      const home = p.match?.home_team?.code ?? '?'
      const away = p.match?.away_team?.code ?? '?'
      const teams = `${home} vs ${away}`
      if (t.reason === 'prediction_exact') {
        out.push({ kind: 'prediction_exact', at: ts, matchId: p.match_id, teams })
      } else {
        out.push({ kind: 'prediction_hit', at: ts, matchId: p.match_id, teams, points: p.points ?? 0 })
      }
    } else if (t.reason === 'create_pool') {
      const name = poolById.get(t.ref_id as string) ?? 'pool'
      out.push({ kind: 'pool_create', at: ts, poolName: name, poolId: t.ref_id as string })
    } else if (t.reason === 'referral_bonus') {
      out.push({ kind: 'referral', at: ts, amount: t.amount as number })
    }
  }

  // Pool joins where not creator
  const { data: members } = await supabase
    .from('pool_members')
    .select('pool_id, joined_at, pool:pool_id(name, creator_id)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(limit)

  for (const m of (members ?? [])) {
    const pool = m.pool as unknown as { name: string; creator_id: string } | null
    if (!pool) continue
    if (pool.creator_id === user.id) continue  // already covered by create_pool
    out.push({ kind: 'pool_join', at: m.joined_at as string, poolName: pool.name, poolId: m.pool_id as string })
  }

  // Achievements
  const { data: achs } = await supabase
    .from('user_achievements')
    .select('code, unlocked_at')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })
    .limit(limit)

  for (const a of (achs ?? [])) {
    const def = ACH_BY_CODE.get(a.code as string)
    if (!def) continue
    out.push({ kind: 'achievement', at: a.unlocked_at as string, code: a.code as string, title: def.title, icon: def.icon })
  }

  // Sort by date desc, slice
  out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  return out.slice(0, limit)
}
