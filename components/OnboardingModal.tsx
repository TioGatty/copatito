'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/profile'

const SLIDES = 3

export default function OnboardingModal() {
  const [slide, setSlide] = useState(0)
  const [pending, start] = useTransition()
  const router = useRouter()
  const touchStart = useRef<number | null>(null)

  function finish() {
    start(async () => {
      await completeOnboarding()
      router.refresh()
    })
  }

  function next() {
    if (slide < SLIDES - 1) setSlide(s => s + 1)
    else finish()
  }
  function prev() {
    if (slide > 0) setSlide(s => s - 1)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current == null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (dx < -50) next()
    else if (dx > 50) prev()
    touchStart.current = null
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg-0)',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header: skip */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={finish}
          disabled={pending}
          style={{
            padding: '6px 14px', borderRadius: 999,
            background: 'transparent', border: '0.5px solid var(--line-soft)',
            color: 'var(--t-3)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Saltar
        </button>
      </div>

      {/* Slides */}
      <div
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: 'flex',
            width: `${SLIDES * 100}%`,
            height: '100%',
            transform: `translateX(-${slide * (100 / SLIDES)}%)`,
            transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
          }}
        >
          <Slide1/>
          <Slide2/>
          <Slide3/>
        </div>
      </div>

      {/* Dots indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '12px 0',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: i === slide ? 24 : 8,
            height: 8, borderRadius: 4,
            background: i === slide ? 'var(--gold)' : 'var(--line)',
            transition: 'all 0.25s ease',
          }}/>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={next}
          disabled={pending}
          style={{
            width: '100%', height: 56,
            background: 'var(--gold)', color: 'var(--btn-primary-text)',
            border: 'none', borderRadius: 16,
            fontFamily: 'inherit', fontSize: 17, fontWeight: 700,
            cursor: pending ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {slide < SLIDES - 1 ? 'Siguiente' : (pending ? '…' : 'Empezar a jugar')}
        </button>
      </div>
    </div>
  )
}

function SlideWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: `${100 / SLIDES}%`,
      height: '100%', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', textAlign: 'center',
    }}>
      {children}
    </div>
  )
}

function Slide1() {
  return (
    <SlideWrap>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, color: 'var(--gold)',
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <h1 className="display" style={{
        fontSize: 28, fontWeight: 700, margin: '0 0 12px',
        letterSpacing: '-0.02em', color: 'var(--t-1)',
      }}>
        Pronosticá el Mundial 2026
      </h1>
      <p style={{
        fontSize: 15, color: 'var(--t-2)', lineHeight: 1.5,
        margin: 0, maxWidth: 320,
      }}>
        Adiviná el resultado de cada uno de los 104 partidos. Cuanto más cerca del marcador real, más puntos sumás.
      </p>

      {/* mock score */}
      <div style={{
        marginTop: 32, padding: '16px 20px',
        background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
        borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>🇲🇽</span>
        <span className="mono display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)' }}>2</span>
        <span style={{ color: 'var(--t-4)' }}>:</span>
        <span className="mono display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)' }}>1</span>
        <span style={{ fontSize: 24 }}>🇦🇷</span>
      </div>
    </SlideWrap>
  )
}

function Slide2() {
  return (
    <SlideWrap>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, color: 'var(--gold)',
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4h10v5a5 5 0 01-10 0V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M9 19h6M12 14v5"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      <h1 className="display" style={{
        fontSize: 28, fontWeight: 700, margin: '0 0 12px',
        letterSpacing: '-0.02em', color: 'var(--t-1)',
      }}>
        Cada acierto suma
      </h1>
      <p style={{
        fontSize: 15, color: 'var(--t-2)', lineHeight: 1.5,
        margin: 0, maxWidth: 320,
      }}>
        Ganás puntos según qué tan cerca estés del resultado real.
      </p>

      <div style={{
        marginTop: 28, width: '100%', maxWidth: 320,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {[
          { pts: '+10', label: 'Score exacto', color: 'var(--gold)' },
          { pts: '+6', label: 'Diferencia de gol', color: 'var(--pitch)' },
          { pts: '+3', label: 'Ganador correcto', color: 'var(--sky)' },
        ].map(r => (
          <div key={r.pts} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--bg-1)', border: '0.5px solid var(--line-soft)',
          }}>
            <span className="mono" style={{
              padding: '4px 10px', borderRadius: 8, minWidth: 48, textAlign: 'center',
              background: 'var(--pill-gold-bg)', color: r.color,
              fontWeight: 700, fontSize: 14,
            }}>{r.pts}</span>
            <span style={{ fontSize: 14, color: 'var(--t-1)', fontWeight: 600 }}>{r.label}</span>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: 14, fontSize: 12, color: 'var(--t-3)',
      }}>
        ⚡ Bonus por fase: hasta <strong style={{ color: 'var(--gold)' }}>×5</strong> en la Final
      </p>
    </SlideWrap>
  )
}

function Slide3() {
  return (
    <SlideWrap>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, color: 'var(--gold)',
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="display" style={{
        fontSize: 28, fontWeight: 700, margin: '0 0 12px',
        letterSpacing: '-0.02em', color: 'var(--t-1)',
      }}>
        Competí con amigos
      </h1>
      <p style={{
        fontSize: 15, color: 'var(--t-2)', lineHeight: 1.5,
        margin: 0, maxWidth: 320,
      }}>
        Creá un pool privado, compartí un código de 6 dígitos y armá tu liga del Mundial con tus amigos.
      </p>

      <div style={{
        marginTop: 28, padding: '16px 20px',
        background: 'var(--accent-soft)',
        border: '0.5px solid var(--accent-soft-2)',
        borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--gold)">
          <circle cx="12" cy="12" r="9" opacity="0.25"/>
          <circle cx="12" cy="12" r="6.5" fill="none" stroke="var(--gold)" strokeWidth="1.8"/>
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--gold)">C</text>
        </svg>
        <div style={{ textAlign: 'left' }}>
          <div className="mono display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>
            100 monedas
          </div>
          <div style={{ fontSize: 12, color: 'var(--t-2)' }}>
            de bienvenida para crear tu primer pool
          </div>
        </div>
      </div>
    </SlideWrap>
  )
}
