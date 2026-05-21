import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import RealtimeRefresh from '@/components/RealtimeRefresh'
import ThemeSync from '@/components/ThemeSync'
import OnboardingModal from '@/components/OnboardingModal'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('theme_pref, onboarded')
    .eq('id', user.id)
    .single()
  const themePref = (profile?.theme_pref as 'dark' | 'light' | null) ?? 'dark'
  const onboarded = (profile?.onboarded as boolean | null) ?? false

  return (
    <div className="app">
      <ThemeSync themePref={themePref}/>
      <RealtimeRefresh />
      {children}
      <BottomNav />
      {!onboarded && <OnboardingModal/>}
    </div>
  )
}
