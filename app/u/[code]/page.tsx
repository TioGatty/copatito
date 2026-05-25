export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/Avatar'
import PublicProfileShare from '@/components/PublicProfileShare'

interface PublicProfile {
  user_id: string
  display_name: string
  avatar_preset: number
  points: number
  predictions: number
  hits: number
  exacts: number
  achievements: number
  global_rank: number
  referral_code: string
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return {
    title: `${code} · CopaTío`,
    description: `Mirá las predicciones de este jugador en el Mundial 2026.`,
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_public_profile', { p_code: code.toUpperCase() })
  if (error || !data || (Array.isArray(data) && data.length === 0)) notFound()
  const p = (Array.isArray(data) ? data[0] : data) as PublicProfile

  const { data: { user: me } } = await supabase.auth.getUser()
  const isMe = me?.id === p.user_id

  const initials = (p.display_name || 'JJ').slice(0, 2).toUpperCase()
  const accuracy = p.predictions > 0 ? Math.round((p.hits / p.predictions) * 100) : 0

  return (
    <div className="screen-body">
      {/* Hero band */}
      <div style={{
        position: 'relative',
        padding: '24px 20px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.65 0.22 5 / 0.2), transparent 60%), var(--gradient-hero)',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div className="sun-motif" style={{ opacity: 0.4 }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ marginBottom: 14 }}>
            <Avatar initials={initials} preset={p.avatar_preset} size={96} ring/>
          </div>
          <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {p.display_name}
          </h1>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--t-3)' }}>
            CopaTío · Mundial 2026
          </div>
          {p.global_rank > 0 && (
            <div style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 999,
              background: 'var(--accent-soft)', border: '0.5px solid var(--accent-soft-2)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--t-3)', fontWeight: 600 }}>Posición</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>#{p.global_rank}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats tiles */}
      <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 2 }}>
        <div className="card" style={{ padding: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <Tile label="Puntos" value={p.points}/>
          <Tile label="Aciertos" value={`${p.hits}/${p.predictions}`} divider/>
          <Tile label="Exactos" value={p.exacts} divider/>
          <Tile label="Precisión" value={`${accuracy}%`}/>
        </div>
      </div>

      {/* Share + CTA */}
      <div style={{ padding: '20px 20px 0' }}>
        <PublicProfileShare code={p.referral_code} name={p.display_name}/>
      </div>

      {/* Join CTA (if not me, anon or different user) */}
      {!isMe && (
        <div style={{ padding: '14px 20px' }}>
          <Link
            href={me ? '/home' : `/?ref=${p.referral_code}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--gold)', color: 'var(--btn-primary-text)',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}
          >
            {me ? 'Ir a mi CopaTío' : 'Unirme con su código (+20 monedas)'}
          </Link>
        </div>
      )}

      {/* Footer cta */}
      <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: 12, color: 'var(--t-3)' }}>
        <Link href="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 700 }}>
          CopaTío
        </Link>
        {' · '}Predicciones del Mundial 2026
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}

function Tile({ label, value, divider }: { label: string; value: number | string; divider?: boolean }) {
  return (
    <div style={{
      padding: '14px 8px', textAlign: 'center',
      borderLeft: divider ? '0.5px solid var(--line-soft)' : 'none',
    }}>
      <div className="mono display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}
