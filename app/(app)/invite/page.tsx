export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InviteShareCard from '@/components/InviteShareCard'

export default async function InvitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  const code = (profile?.referral_code as string | null) ?? ''

  // Count referrals (people who joined with my code)
  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)

  const earned = (count ?? 0) * 20

  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 16px', position: 'relative', overflow: 'hidden' }}>
        <div className="sun-motif" style={{ opacity: 0.4 }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/profile" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 13, color: 'var(--t-3)', textDecoration: 'none', marginBottom: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Perfil
          </Link>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Invitá amigos
          </h1>
          <div style={{ fontSize: 13, color: 'var(--t-3)' }}>
            +20 monedas para vos y +20 para cada amigo que se sume.
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <InviteShareCard code={code}/>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="card" style={{ padding: 16, display: 'flex', gap: 16, justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="mono display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{count ?? 0}</div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: 2 }}>
              Amigos
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--line-soft)' }}/>
          <div style={{ textAlign: 'center' }}>
            <div className="mono display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>+{earned}</div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: 2 }}>
              Monedas ganadas
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
          Cómo funciona
        </div>
        <ol style={{ paddingLeft: 20, fontSize: 14, color: 'var(--t-2)', lineHeight: 1.7 }}>
          <li>Compartí tu link o código</li>
          <li>Tu amigo se registra y completa el tour</li>
          <li>Ambos reciben <strong style={{ color: 'var(--gold)' }}>+20 monedas</strong> automático</li>
        </ol>
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}
