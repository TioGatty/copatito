export interface Pool {
  id: string
  name: string
  code: string
  creator_id: string
  created_at: string
  cost: number
}

export interface PoolMember {
  id: string
  pool_id: string
  user_id: string
  joined_at: string
}

export type CoinReason =
  | 'initial_grant'
  | 'prediction_hit'
  | 'prediction_exact'
  | 'daily_bonus'
  | 'streak_bonus'
  | 'create_pool'
  | 'admin_adjust'

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  reason: CoinReason
  ref_id: string | null
  created_at: string
}

export interface PoolWithMeta extends Pool {
  member_count: number
  is_creator: boolean
}

export interface PoolRankingEntry {
  user_id: string
  display_name: string
  initials: string
  avatar_preset: number
  points: number
  predictions: number
  hits: number
  is_me: boolean
}
