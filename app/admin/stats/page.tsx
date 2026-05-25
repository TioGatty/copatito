export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/Avatar'

interface Stats {
  total_users: number
  dau: number
  wau: number
  signups_24h: number
  total_predictions: number
  total_hits: number
  total_exacts: number
  total_points_awarded: number
  total_pools: number
  total_pool_memberships: number
  coins_in_circulation: number
  total_referrals: number
  matches_finished: number
  matches_live: number
  matches_scheduled: number
  total_achievements_unlocked: number
}

interface TopUser {
  user_id: string
  display_name: string
  avatar_preset: number
  email: string
  points: number
  predictions: number
  hits: number
  pools_owned: number
  joined_at: string
}

export default async function AdminStatsPage() {
  const supabase = await createClient()
  const { data: statsRaw } = await supabase.rpc('get_admin_stats')
  const { data: topRaw } = await supabase.rpc('get_admin_top_users', { p_limit: 20 })
  const s = (statsRaw ?? {}) as Stats
  const top = (topRaw ?? []) as TopUser[]

  const accuracy = s.total_predictions > 0
    ? Math.round((s.total_hits / s.total_predictions) * 100) : 0
  const exactRate = s.total_predictions > 0
    ? ((s.total_exacts / s.total_predictions) * 100).toFixed(1) : '0.0'
  const predsPerUser = s.total_users > 0
    ? (s.total_predictions / s.total_users).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link href="/admin/matches" className="text-xs text-yellow-400 underline">
          → Cargar resultados
        </Link>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Usuarios totales" value={s.total_users} hint={`+${s.signups_24h} en 24h`}/>
        <Kpi label="Activos 24h" value={s.dau} hint={`${s.wau} en 7 días`}/>
        <Kpi label="Pronósticos" value={s.total_predictions} hint={`${predsPerUser} por user`}/>
        <Kpi label="Precisión global" value={`${accuracy}%`} hint={`${s.total_hits} aciertos`}/>
      </div>

      {/* Game economy */}
      <Section title="Economía">
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Monedas en circulación" value={s.coins_in_circulation}/>
          <Kpi label="Puntos repartidos" value={s.total_points_awarded}/>
          <Kpi label="Pools creados" value={s.total_pools} hint={`${s.total_pool_memberships} memberships`}/>
          <Kpi label="Referidos" value={s.total_referrals}/>
        </div>
      </Section>

      {/* Predictions detail */}
      <Section title="Pronósticos">
        <div className="grid grid-cols-3 gap-3">
          <Kpi label="Aciertos" value={s.total_hits}/>
          <Kpi label="Scores exactos" value={s.total_exacts} hint={`${exactRate}%`}/>
          <Kpi label="Logros desbloq." value={s.total_achievements_unlocked}/>
        </div>
      </Section>

      {/* Match status */}
      <Section title="Estado del torneo">
        <div className="grid grid-cols-3 gap-3">
          <Kpi label="Finalizados" value={s.matches_finished}/>
          <Kpi label="En vivo" value={s.matches_live}/>
          <Kpi label="Pendientes" value={s.matches_scheduled}/>
        </div>
      </Section>

      {/* Top users */}
      <Section title={`Top ${top.length} usuarios`}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {top.map((u, i) => (
            <div key={u.user_id} style={{
              padding: '10px 12px',
              display: 'grid', gridTemplateColumns: '24px 32px 1fr 60px 60px',
              gap: 10, alignItems: 'center',
              borderBottom: i < top.length - 1 ? '0.5px solid var(--line-soft)' : 'none',
            }}>
              <span className="mono text-xs" style={{ color: 'var(--t-3)', fontWeight: 700 }}>#{i+1}</span>
              <Avatar initials={(u.display_name || 'JJ').slice(0,2).toUpperCase()} preset={u.avatar_preset} size={28}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.display_name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--t-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                </div>
              </div>
              <span className="mono text-xs" style={{ color: 'var(--t-3)', textAlign: 'right' }}>
                {u.hits}/{u.predictions}
              </span>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)', textAlign: 'right' }}>
                {u.points}
              </span>
            </div>
          ))}
          {top.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--t-3)' }}>
              Sin usuarios todavía.
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

function Kpi({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        {label}
      </div>
      <div className="mono display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--t-1)', marginTop: 4, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 10, color: 'var(--t-4)', marginTop: 2 }}>{hint}</div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8, marginTop: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}
