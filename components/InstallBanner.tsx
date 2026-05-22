'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'copatio-install-dismissed'
const DISMISS_DAYS = 7

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isiOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
  return isiOS
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS PWA mode + Chrome PWA
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < DISMISS_DAYS * 24 * 3600 * 1000
  } catch { return false }
}

export default function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    if (isStandalone() || isDismissed()) return

    // Android Chrome / desktop: beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setHidden(false)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS: no event — show our own instructions
    if (detectIOS()) {
      setShowIOS(true)
      setHidden(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch {}
    setHidden(true)
  }

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const r = await promptEvent.userChoice
    if (r.outcome === 'accepted') {
      setHidden(true)
    } else {
      dismiss()
    }
  }

  if (hidden) return null

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        margin: '0 20px 8px',
        borderRadius: 12,
        background: 'var(--accent-soft)',
        border: '0.5px solid var(--accent-soft-2)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, oklch(0.65 0.22 5), oklch(0.82 0.16 80))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: 'oklch(0.18 0.04 60)',
          flexShrink: 0,
        }}>CT</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--selected-text)' }}>
            Instalá CopaTío en tu celu
          </div>
          <div style={{ fontSize: 11, color: 'var(--t-3)' }}>
            Apertura rápida desde tu pantalla de inicio
          </div>
        </div>
        {showIOS ? (
          <button onClick={() => setShowIOSModal(true)} style={btnPrimary}>Cómo</button>
        ) : (
          <button onClick={install} style={btnPrimary}>Instalar</button>
        )}
        <button onClick={dismiss} aria-label="Cerrar" style={btnClose}>×</button>
      </div>

      {showIOSModal && (
        <div onClick={() => setShowIOSModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'oklch(0 0 0 / 0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 480, background: 'var(--bg-1)',
            borderRadius: '20px 20px 0 0',
            padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 14px' }}/>
            <h2 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>
              Instalar en iPhone
            </h2>
            <ol style={{ paddingLeft: 20, fontSize: 14, color: 'var(--t-2)', lineHeight: 1.7, margin: 0 }}>
              <li>Tocá el botón <strong>Compartir</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }}>
                  <path d="M12 2v14M5 9l7-7 7 7M5 14v6a2 2 0 002 2h10a2 2 0 002-2v-6"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {' '}abajo de Safari
              </li>
              <li>Scrolleá y tocá <strong>Agregar a inicio</strong></li>
              <li>Confirmá <strong>Agregar</strong> arriba a la derecha</li>
            </ol>
            <button onClick={() => { setShowIOSModal(false); dismiss() }} style={{
              ...btnPrimary, width: '100%', marginTop: 18, padding: '12px 16px', fontSize: 14,
            }}>Entendido</button>
          </div>
        </div>
      )}
    </>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 8,
  background: 'var(--gold)', color: 'var(--btn-primary-text)',
  border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  flexShrink: 0,
}
const btnClose: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 999,
  background: 'transparent', border: 'none',
  color: 'var(--t-3)', cursor: 'pointer', fontSize: 18,
  lineHeight: 1, flexShrink: 0,
  WebkitTapHighlightColor: 'transparent',
}
