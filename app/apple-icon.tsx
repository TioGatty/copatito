import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, oklch(0.65 0.22 5), oklch(0.82 0.16 80))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 84,
          fontWeight: 800,
          color: 'oklch(0.18 0.04 60)',
          letterSpacing: '-0.04em',
        }}
      >
        CT
      </div>
    ),
    { ...size }
  )
}
