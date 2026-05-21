// 12 gradient presets — same indices used in DB (profiles.avatar_preset 0..11)
export const AVATAR_PRESETS = [
  { from: 'oklch(0.65 0.22 5)',  to: 'oklch(0.82 0.16 80)',  text: 'oklch(0.18 0.04 60)' }, // magenta→gold (default)
  { from: 'oklch(0.55 0.18 145)', to: 'oklch(0.7 0.16 220)', text: '#fff' },                // green→blue
  { from: 'oklch(0.55 0.2 260)', to: 'oklch(0.7 0.2 320)',  text: '#fff' },                // blue→purple
  { from: 'oklch(0.65 0.2 330)', to: 'oklch(0.7 0.2 25)',   text: '#fff' },                // pink→orange
  { from: 'oklch(0.72 0.18 50)', to: 'oklch(0.82 0.18 95)', text: 'oklch(0.2 0.04 60)' },  // orange→yellow
  { from: 'oklch(0.7 0.13 195)', to: 'oklch(0.6 0.14 170)', text: '#fff' },                // cyan→teal
  { from: 'oklch(0.55 0.2 25)',  to: 'oklch(0.4 0.18 12)',  text: '#fff' },                // red→burgundy
  { from: 'oklch(0.65 0.18 145)', to: 'oklch(0.78 0.18 125)', text: 'oklch(0.18 0.04 60)' }, // emerald→lime
  { from: 'oklch(0.55 0.02 60)', to: 'oklch(0.75 0.01 60)', text: 'oklch(0.18 0.01 60)' }, // gray
  { from: 'oklch(0.68 0.17 65)', to: 'oklch(0.5 0.15 55)',  text: 'oklch(0.18 0.04 60)' }, // gold→bronze
  { from: 'oklch(0.55 0.2 285)', to: 'oklch(0.65 0.22 265)', text: '#fff' },               // violet→indigo
  { from: 'oklch(0.6 0.2 200)',  to: 'oklch(0.7 0.22 235)', text: '#fff' },                // ocean
] as const

export interface AvatarProps {
  initials: string
  preset?: number | null
  size?: number
  ring?: boolean
}

export default function Avatar({ initials, preset = 0, size = 38, ring = false }: AvatarProps) {
  const idx = Math.max(0, Math.min(11, preset ?? 0))
  const p = AVATAR_PRESETS[idx]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-bricolage, system-ui)', fontWeight: 700,
      fontSize: Math.round(size * 0.38),
      color: p.text,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px var(--gold), 0 8px 24px oklch(0 0 0 / 0.4)` : undefined,
      border: ring ? '3px solid var(--bg-0)' : undefined,
    }}>
      {(initials || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}
