import { createClient } from '@/lib/supabase/server'

export interface Unlock {
  code: string
  unlocked_at: string
}

export async function getUserAchievements(): Promise<Unlock[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('user_achievements')
    .select('code, unlocked_at')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })
  return (data ?? []) as Unlock[]
}
