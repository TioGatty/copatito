import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  // Capture referral code from URL into cookie (claimed after onboarding)
  const sp = await searchParams
  if (sp.ref && /^[A-Za-z0-9]{6}$/.test(sp.ref)) {
    const ck = await cookies()
    ck.set('ref', sp.ref.toUpperCase(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')
  else redirect('/login')
}
