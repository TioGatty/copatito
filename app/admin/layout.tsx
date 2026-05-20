import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_60)] text-white">
      <div className="max-w-lg mx-auto p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">ADMIN</span>
        </div>
        {children}
      </div>
    </div>
  )
}
