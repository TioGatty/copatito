import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_60)] text-white max-w-lg mx-auto relative">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
