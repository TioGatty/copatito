'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type AdminResult = { ok: true } | { ok: false; error: string }

async function assertAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return null
  return user.id
}

export async function saveMatchScore(input: {
  matchId: string
  homeScore: number | null
  awayScore: number | null
}): Promise<AdminResult> {
  const uid = await assertAdmin()
  if (!uid) return { ok: false, error: 'forbidden' }
  if (!/^[0-9a-f-]{36}$/i.test(input.matchId)) return { ok: false, error: 'bad_id' }

  const h = input.homeScore
  const a = input.awayScore
  if (h != null && (!Number.isFinite(h) || h < 0 || h > 20)) return { ok: false, error: 'bad_home' }
  if (a != null && (!Number.isFinite(a) || a < 0 || a > 20)) return { ok: false, error: 'bad_away' }

  const status = (h != null && a != null) ? 'finished' : 'scheduled'

  const admin = createAdminClient()
  const { error } = await admin
    .from('matches')
    .update({ home_score: h, away_score: a, status })
    .eq('id', input.matchId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/matches')
  revalidatePath('/bracket')
  revalidatePath('/home')
  revalidatePath('/profile')
  revalidatePath('/ranking')
  return { ok: true }
}

export async function revertMatch(matchId: string): Promise<AdminResult> {
  const uid = await assertAdmin()
  if (!uid) return { ok: false, error: 'forbidden' }
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return { ok: false, error: 'bad_id' }

  const admin = createAdminClient()

  // 1. Reverse coin awards BEFORE clearing scores (RPC needs scores to detect exact)
  const { error: rcErr } = await admin.rpc('reverse_match_coin_awards', { p_match_id: matchId })
  if (rcErr) {
    console.error('[revertMatch] reverse_match_coin_awards', rcErr)
    return { ok: false, error: 'reverse_failed' }
  }

  // 2. Clear match scores + status
  const { error: mErr } = await admin
    .from('matches')
    .update({ home_score: null, away_score: null, status: 'scheduled' })
    .eq('id', matchId)
  if (mErr) {
    console.error('[revertMatch] update match', mErr)
    return { ok: false, error: 'db_error' }
  }

  // 3. Clear computed points on related predictions
  await admin.from('predictions').update({ points: null }).eq('match_id', matchId)

  revalidatePath('/admin/matches')
  revalidatePath('/bracket')
  revalidatePath('/home')
  revalidatePath('/profile')
  revalidatePath('/ranking')
  return { ok: true }
}
