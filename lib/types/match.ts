// lib/types/match.ts

export type Phase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter'
  | 'semi'
  | 'third_place'
  | 'final'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Group {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_id: string | null
}

export interface Match {
  id: string
  match_number: number
  phase: Phase
  home_team_id: string | null
  away_team_id: string | null
  home_placeholder: string | null
  away_placeholder: string | null
  venue: string
  city: string
  kickoff_at: string
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  api_football_id: number | null
  // joined fields
  home_team?: Team | null
  away_team?: Team | null
}
