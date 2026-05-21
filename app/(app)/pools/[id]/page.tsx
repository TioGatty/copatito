export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPoolDetail } from '@/lib/pools/fetch'
import PoolShareCard from '@/components/PoolShareCard'
import PoolLeaveButton from '@/components/PoolLeaveButton'
import Avatar from '@/components/Avatar'
import { createClient } from '@/lib/supabase/server'

export default async function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getPoolDetail(id)
  if (!detail) notFound()
  const { pool, ranking } = detail

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isCreator = user?.id === pool.creator_id

  return (
    <div className="screen-body">
      {/* Back nav */}
      <div style={{ padding: '4px 20px 8px' }}>
        <Link href="/pools" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--t-3)', textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Pools
        </Link>
      </div>

      {/* Header */}
      <div style={{ padding: '0 20px 12px' }}>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          {pool.name}
        </h1>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
          {ranking.length} miembro{ranking.length === 1 ? '' : 's'} · Costo <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{pool.cost}</span> · Creado {new Date(pool.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      {/* Share card */}
      <div style={{ padding: '0 20px 16px' }}>
        <PoolShareCard pool={pool}/>
      </div>

      {/* Ranking */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
          Ranking
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {ranking.map((r, i) => (
            <Link key={r.user_id} href={`/pools/${pool.id}/m/${r.user_id}`} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 50px 60px',
              gap: 10, alignItems: 'center',
              padding: '12px 14px',
              borderBottom: i < ranking.length - 1 ? '0.5px solid var(--line-soft)' : 'none',
              background: r.is_me ? 'var(--accent-soft)' : 'transparent',
              textDecoration: 'none', color: 'inherit',
            }}>
              <span className="mono" style={{
                fontSize: 14, fontWeight: 700,
                color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--t-2)' : 'var(--t-3)',
                textAlign: 'center',
              }}>#{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Avatar initials={r.initials} preset={r.avatar_preset} size={28}/>
                <span style={{
                  fontSize: 13, fontWeight: r.is_me ? 700 : 600,
                  color: r.is_me ? 'var(--gold)' : 'var(--t-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {r.display_name}{r.is_me && <span style={{ color: 'var(--t-3)', fontWeight: 500 }}> (vos)</span>}
                </span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--t-3)', textAlign: 'right' }}>
                {r.hits}/{r.predictions}
              </span>
              <span className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--t-1)', textAlign: 'right' }}>
                {r.points}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Leave button */}
      {!isCreator && (
        <div style={{ padding: '24px 20px 8px' }}>
          <PoolLeaveButton poolId={pool.id}/>
        </div>
      )}
      {isCreator && (
        <div style={{ padding: '24px 20px 8px', textAlign: 'center', fontSize: 12, color: 'var(--t-3)' }}>
          Como creador, no podés dejar este pool.
        </div>
      )}

      <div style={{ height: 16 }}/>
    </div>
  )
}
