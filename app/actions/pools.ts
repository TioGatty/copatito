'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PoolActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function createPool(name: string, cost: number): Promise<PoolActionResult<{ id: string; code: string; cost: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }
  const trimmed = name.trim()
  if (trimmed.length < 3) return { ok: false, error: 'name_too_short' }
  if (trimmed.length > 40) return { ok: false, error: 'name_too_long' }
  const c = Math.floor(cost)
  if (!Number.isFinite(c) || c < 0 || c > 1000) return { ok: false, error: 'invalid_cost' }

  const { data, error } = await supabase.rpc('create_pool', { p_name: trimmed, p_cost: c })
  if (error) return { ok: false, error: parseSupabaseError(error.message) }
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.id) return { ok: false, error: 'create_failed' }

  revalidatePath('/pools')
  revalidatePath('/home')
  return { ok: true, data: { id: row.id, code: row.code, cost: row.cost } }
}

export async function joinPool(code: string): Promise<PoolActionResult<{ id: string; name: string; cost: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }
  const clean = code.trim().toUpperCase()
  if (clean.length !== 6) return { ok: false, error: 'invalid_code' }

  const { data, error } = await supabase.rpc('join_pool', { p_code: clean })
  if (error) return { ok: false, error: parseSupabaseError(error.message) }
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.id) return { ok: false, error: 'join_failed' }

  revalidatePath('/pools')
  return { ok: true, data: { id: row.id, name: row.name, cost: row.cost ?? 0 } }
}

export async function leavePool(poolId: string): Promise<PoolActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }

  const { error } = await supabase
    .from('pool_members')
    .delete()
    .eq('pool_id', poolId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/pools')
  return { ok: true, data: null }
}

function parseSupabaseError(msg: string): string {
  const m = msg.match(/(no_auth|insufficient_coins|pool_limit_reached|name_too_short|name_too_long|pool_not_found|already_member|code_generation_failed|invalid_cost)/)
  return m?.[1] ?? msg
}
