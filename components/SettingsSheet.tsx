'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar, { AVATAR_PRESETS } from '@/components/Avatar'
import { updateAvatarPreset, setLocale, setThemePref } from '@/app/actions/profile'
import { isSoundEnabled, setSoundEnabled, playClick } from '@/lib/sound'
import { useEffect } from 'react'

interface Props {
  initials: string
  currentPreset: number
  currentLocale: 'es' | 'en'
  currentTheme: 'dark' | 'light'
}

export default function SettingsSheet({ initials, currentPreset, currentLocale, currentTheme }: Props) {
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState(currentPreset)
  const [locale, setLoc] = useState<'es' | 'en'>(currentLocale)
  const [theme, setTheme] = useState<'dark' | 'light'>(currentTheme)
  const [sound, setSound] = useState(true)
  const [pending, start] = useTransition()
  const router = useRouter()

  useEffect(() => { setSound(isSoundEnabled()) }, [])

  function toggleSound(on: boolean) {
    setSound(on)
    setSoundEnabled(on)
    if (on) playClick()
  }

  function selectPreset(i: number) {
    setPreset(i)
    start(async () => { await updateAvatarPreset(i); router.refresh() })
  }
  function selectLocale(l: 'es' | 'en') {
    setLoc(l)
    start(async () => { await setLocale(l); router.refresh() })
  }
  function selectTheme(t: 'dark' | 'light') {
    setTheme(t)
    document.documentElement.dataset.theme = t
    try { localStorage.setItem('copatio-theme', t) } catch {}
    start(async () => { await setThemePref(t) })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Ajustes"
        style={{
          padding: '6px 14px', borderRadius: 999,
          background: 'var(--bg-2)',
          border: '0.5px solid var(--line)',
          color: 'var(--t-2)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ajustes
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'oklch(0 0 0 / 0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-1)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 12px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="display" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Ajustes</h2>
          <button onClick={() => setOpen(false)} aria-label="Cerrar" style={{
            background: 'var(--bg-3)', border: 'none', borderRadius: 999,
            width: 32, height: 32, color: 'var(--t-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Avatar section */}
        <Section label="Avatar">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 10, padding: '4px 0',
          }}>
            {AVATAR_PRESETS.map((_, i) => (
              <button
                key={i}
                onClick={() => selectPreset(i)}
                disabled={pending}
                style={{
                  padding: 0, background: 'transparent',
                  border: i === preset ? '2px solid var(--gold)' : '2px solid transparent',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={`Avatar ${i + 1}`}
              >
                <Avatar initials={initials} preset={i} size={44}/>
              </button>
            ))}
          </div>
        </Section>

        {/* Language */}
        <Section label="Idioma">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Choice active={locale === 'es'} onClick={() => selectLocale('es')} disabled={pending}>
              🇪🇸 Español
            </Choice>
            <Choice active={locale === 'en'} onClick={() => selectLocale('en')} disabled={pending}>
              🇺🇸 English
            </Choice>
          </div>
        </Section>

        {/* Theme */}
        <Section label="Tema">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Choice active={theme === 'dark'} onClick={() => selectTheme('dark')} disabled={pending}>
              🌙 Oscuro
            </Choice>
            <Choice active={theme === 'light'} onClick={() => selectTheme('light')} disabled={pending}>
              ☀️ Claro
            </Choice>
          </div>
        </Section>

        {/* Sound */}
        <Section label="Sonidos">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Choice active={sound} onClick={() => toggleSound(true)} disabled={false}>
              🔊 Activados
            </Choice>
            <Choice active={!sound} onClick={() => toggleSound(false)} disabled={false}>
              🔇 Apagados
            </Choice>
          </div>
        </Section>

        <Link
          href="/rules"
          onClick={() => setOpen(false)}
          style={{
            display: 'block', textAlign: 'center', marginTop: 20, marginBottom: 8,
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--bg-2)', border: '0.5px solid var(--line-soft)',
            color: 'var(--gold)', fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          📖 Ver reglas del juego
        </Link>

        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--t-4)', textAlign: 'center' }}>
          Los cambios se guardan en tu cuenta y se sincronizan entre dispositivos.
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, color: 'var(--t-3)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
      }}>{label}</div>
      {children}
    </div>
  )
}

function Choice({ active, onClick, disabled, children }: {
  active: boolean
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 14px', borderRadius: 12,
        background: active ? 'var(--pill-gold-bg)' : 'var(--bg-2)',
        border: `0.5px solid ${active ? 'var(--gold-deep)' : 'var(--line-soft)'}`,
        color: active ? 'var(--gold)' : 'var(--t-1)',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >{children}</button>
  )
}
