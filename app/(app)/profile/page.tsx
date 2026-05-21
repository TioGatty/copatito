export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllUserPredictionsWithMatch, getUserTotalPoints } from '@/lib/predictions/fetch'
import { getCoinBalance } from '@/lib/pools/fetch'
import { getMyGlobalRank } from '@/lib/ranking/fetch'
import MyPredictionsList, { type PredictionWithMatch } from '@/components/MyPredictionsList'
import EditNameButton from '@/components/EditNameButton'
import Avatar from '@/components/Avatar'
import SettingsSheet from '@/components/SettingsSheet'

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c3 5 6 7 6 11a6 6 0 11-12 0c0-2 1-3 2-4-1 3 1 4 2 4 0-3-1-6 2-11z"/>
    </svg>
  )
}
function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="9" opacity="0.25"/>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="currentColor">C</text>
    </svg>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Profile row
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, coins, avatar_preset, locale, theme_pref')
    .eq('id', user?.id ?? '')
    .single()

  const displayName = (profile?.display_name as string | null) ?? user?.email?.split('@')[0] ?? 'Jugador'
  const initials = displayName.slice(0, 2).toUpperCase()
  const email = user?.email ?? ''
  const coins = (profile?.coins as number | null) ?? 0
  const avatarPreset = (profile?.avatar_preset as number | null) ?? 0
  const locale = (profile?.locale as 'es' | 'en' | null) ?? 'es'
  const themePref = (profile?.theme_pref as 'dark' | 'light' | null) ?? 'dark'

  const [totalPoints, rawPreds, myRank] = await Promise.all([
    getUserTotalPoints(),
    getAllUserPredictionsWithMatch(),
    getMyGlobalRank(),
  ])
  const predictions = rawPreds as unknown as PredictionWithMatch[]

  const scored = predictions.filter(p => p.points != null)
  const hits = scored.filter(p => (p.points ?? 0) > 0).length
  const accuracy = scored.length > 0 ? Math.round((hits / scored.length) * 100) : 0
  const totalCount = predictions.length

  return (
    <div className="screen-body">
      {/* Header band */}
      <div style={{
        position: 'relative',
        padding: '8px 20px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.65 0.22 5 / 0.2), transparent 60%), linear-gradient(180deg, oklch(0.2 0.04 60) 0%, var(--bg-0) 100%)',
        overflow: 'hidden',
      }}>
        <div className="sun-motif" style={{ opacity: 0.4 }}/>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SettingsSheet
            initials={initials}
            currentPreset={avatarPreset}
            currentLocale={locale}
            currentTheme={themePref}
          />
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                padding: '6px 14px', borderRadius: 999,
                background: 'oklch(0.3 0.08 25 / 0.5)',
                border: '0.5px solid oklch(0.4 0.12 25)',
                color: 'var(--lose)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Salir
            </button>
          </form>
        </div>

        <div style={{ position: 'relative', marginTop: 12, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
            <Avatar initials={initials} preset={avatarPreset} size={88} ring/>
          </div>
          <h1 className="display" style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'inline-flex', alignItems: 'center' }}>
            {displayName}
            <EditNameButton currentName={displayName}/>
          </h1>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--t-3)' }}>
            {email}
          </div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'oklch(0.25 0.06 75 / 0.6)', border: '0.5px solid var(--gold-deep)' }}>
            <span style={{ color: 'var(--gold)' }}><FlameIcon/></span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Mundial 2026</span>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 2 }}>
        <div className="card" style={{ padding: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div style={{ padding: '16px 12px', textAlign: 'center' }}>
            <div className="mono display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{totalPoints}</div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2 }}>Puntos</div>
          </div>
          <Link
            href="/ranking"
            style={{
              padding: '16px 12px', textAlign: 'center',
              borderLeft: '0.5px solid var(--line-soft)', borderRight: '0.5px solid var(--line-soft)',
              textDecoration: 'none', color: 'inherit', cursor: 'pointer',
            }}
          >
            <div className="mono display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>
              {myRank ? `#${myRank.rank}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2 }}>Ranking</div>
            {myRank && (
              <div style={{ fontSize: 11, color: 'var(--t-4)', fontWeight: 600, marginTop: 4 }}>de {myRank.total_users}</div>
            )}
          </Link>
          <div style={{ padding: '16px 12px', textAlign: 'center' }}>
            <div className="mono display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{accuracy}%</div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2 }}>Precisión</div>
            <div style={{ fontSize: 11, color: 'var(--t-4)', fontWeight: 600, marginTop: 4 }}>{hits} / {scored.length}</div>
          </div>
        </div>
      </div>

      {/* Coins + Pools quick row */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Link href="/pools" className="card" style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--pill-gold-bg)', color: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CoinIcon size={18}/>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Monedas</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-1)' }}>{coins}</div>
          </div>
        </Link>
        <Link href="/ranking" className="card" style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'oklch(0.3 0.05 75)', color: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4h10v5a5 5 0 01-10 0V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M9 19h6M12 14v5"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Ranking</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-1)' }}>
              {myRank ? `#${myRank.rank}` : '—'}
            </div>
          </div>
        </Link>
      </div>

      {/* My predictions */}
      <div style={{ padding: '20px 20px 8px' }}>
        <h2 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>
          Mis pronósticos
          {totalCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t-3)', marginLeft: 8 }}>
              {totalCount} total
            </span>
          )}
        </h2>
        <MyPredictionsList predictions={predictions}/>
      </div>

      <div style={{ height: 16 }}/>
    </div>
  )
}
