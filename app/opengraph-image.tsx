import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CopaTío — Predicciones del Mundial 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, oklch(0.18 0.04 60) 0%, oklch(0.25 0.06 70) 50%, oklch(0.22 0.08 30) 100%)',
          color: '#fff',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* glow */}
        <div style={{
          position: 'absolute',
          top: -200, right: -200,
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.82 0.16 80 / 0.35), transparent 70%)',
          display: 'flex',
        }}/>

        {/* top brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, oklch(0.65 0.22 5), oklch(0.82 0.16 80))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 800,
            color: 'oklch(0.18 0.04 60)',
          }}>
            CT
          </div>
          <span style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'oklch(0.82 0.16 80)',
          }}>
            CopaTío
          </span>
        </div>

        {/* title */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span>Pronosticá el</span>
            <span style={{ color: 'oklch(0.82 0.16 80)' }}>Mundial 2026</span>
          </div>
          <div style={{
            fontSize: 30,
            color: 'oklch(0.78 0.012 70)',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}>
            <span>104 partidos</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>48 selecciones</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>Pools privados</span>
          </div>
        </div>

        {/* bottom badges */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          gap: 14,
        }}>
          {[
            { label: '+10 EXACTO', bg: 'oklch(0.82 0.16 80)', fg: 'oklch(0.18 0.04 60)' },
            { label: '+6 DIFERENCIA', bg: 'oklch(0.3 0.1 145)', fg: 'oklch(0.85 0.1 145)' },
            { label: '+3 GANADOR', bg: 'oklch(0.3 0.08 235)', fg: 'oklch(0.85 0.1 235)' },
          ].map(b => (
            <div key={b.label} style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: b.bg,
              color: b.fg,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
            }}>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
