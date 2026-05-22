import { ACHIEVEMENTS } from '@/lib/achievements/catalog'
import type { Unlock } from '@/lib/achievements/fetch'

export default function AchievementsGrid({ unlocks }: { unlocks: Unlock[] }) {
  const unlockedSet = new Set(unlocks.map(u => u.code))
  const unlockedCount = unlocks.length
  const total = ACHIEVEMENTS.length

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Logros
        </div>
        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
          {unlockedCount}/{total}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
        gap: 10,
      }}>
        {ACHIEVEMENTS.map(a => {
          const unlocked = unlockedSet.has(a.code)
          return (
            <div key={a.code}
              title={`${a.title} — ${a.desc}`}
              style={{
                aspectRatio: '1', borderRadius: 14,
                background: unlocked ? 'var(--accent-soft)' : 'var(--bg-2)',
                border: `0.5px solid ${unlocked ? 'var(--accent-soft-2)' : 'var(--line-soft)'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: 4,
                opacity: unlocked ? 1 : 0.4,
                filter: unlocked ? 'none' : 'grayscale(0.7)',
              }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{a.icon}</span>
              <span style={{
                fontSize: 9, color: unlocked ? 'var(--selected-text)' : 'var(--t-3)',
                fontWeight: 700, textAlign: 'center', lineHeight: 1.1,
              }}>{a.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
