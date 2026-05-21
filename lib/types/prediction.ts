import type { Match, Phase } from './match'

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  tiebreaker_winner_id: string | null
  points: number | null
  created_at: string
  updated_at: string
}

export type PredictionState =
  | 'open'      // can edit
  | 'locked'    // within 15min window or live
  | 'finished'  // match finished, points known

export const LOCK_MS = 15 * 60 * 1000

export function getPredictionState(match: Match, now: Date = new Date()): PredictionState {
  if (match.status === 'finished') return 'finished'
  if (match.status === 'live') return 'locked'
  const kickoff = new Date(match.kickoff_at).getTime()
  if (kickoff - now.getTime() <= LOCK_MS) return 'locked'
  return 'open'
}

export function phaseMultiplier(phase: Phase): number {
  switch (phase) {
    case 'group':       return 1
    case 'round_of_32': return 1.5
    case 'round_of_16': return 2
    case 'quarter':     return 2.5
    case 'semi':        return 3
    case 'third_place': return 2
    case 'final':       return 5
  }
}

export function isKnockout(phase: Phase): boolean {
  return phase !== 'group'
}

export function needsTiebreaker(match: Match, home: number, away: number): boolean {
  return isKnockout(match.phase) && home === away
}
