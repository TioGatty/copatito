'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Match } from '@/lib/types/match'
import { getPredictionState, isKnockout } from '@/lib/types/prediction'

export type UpsertResult =
  | { ok: true }
  | { ok: false; error: string }

export async function upsertPrediction(input: {
  matchId: string
  homeScore: number
  awayScore: number
  tiebreakerWinnerId?: string | null
}): Promise<UpsertResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }

  const home = Math.floor(input.homeScore)
  const away = Math.floor(input.awayScore)
  if (!Number.isFinite(home) || home < 0 || home > 20) return { ok: false, error: 'invalid_home' }
  if (!Number.isFinite(away) || away < 0 || away > 20) return { ok: false, error: 'invalid_away' }

  const { data: match, error: mErr } = await supabase
    .from('matches')
    .select('*')
    .eq('id', input.matchId)
    .single<Match>()
  if (mErr || !match) return { ok: false, error: 'match_not_found' }

  if (!match.home_team_id || !match.away_team_id) {
    return { ok: false, error: 'teams_not_set' }
  }

  const state = getPredictionState(match)
  if (state !== 'open') return { ok: false, error: 'window_closed' }

  let tiebreaker: string | null = null
  if (isKnockout(match.phase) && home === away) {
    if (!input.tiebreakerWinnerId) return { ok: false, error: 'tiebreaker_required' }
    if (input.tiebreakerWinnerId !== match.home_team_id
        && input.tiebreakerWinnerId !== match.away_team_id) {
      return { ok: false, error: 'tiebreaker_invalid' }
    }
    tiebreaker = input.tiebreakerWinnerId
  }

  const { error: upErr } = await supabase
    .from('predictions')
    .upsert({
      user_id: user.id,
      match_id: input.matchId,
      home_score: home,
      away_score: away,
      tiebreaker_winner_id: tiebreaker,
    }, { onConflict: 'user_id,match_id' })

  if (upErr) {
    console.error('[upsertPrediction]', upErr)
    return { ok: false, error: 'db_error' }
  }

  revalidatePath('/bracket')
  revalidatePath('/home')
  revalidatePath('/profile')
  return { ok: true }
}
