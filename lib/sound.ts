// Synthesized sounds via Web Audio API. No files needed.
// Toggle via localStorage 'copatio-sound' = 'on' | 'off' (default 'on').

const KEY = 'copatio-sound'

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = localStorage.getItem(KEY)
    return v !== 'off'
  } catch { return true }
}

export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch {}
}

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext }
  const w = window as WindowWithWebkit
  const AC = window.AudioContext || w.webkitAudioContext
  if (!AC) return null
  try { ctx = new AC() } catch { return null }
  return ctx
}

function tone(freq: number, durMs: number, type: OscillatorType = 'sine', gain = 0.08) {
  if (!isSoundEnabled()) return
  const c = getCtx()
  if (!c) return
  // Some browsers suspend the ctx until user gesture; safe to call resume
  if (c.state === 'suspended') c.resume().catch(() => {})

  const osc = c.createOscillator()
  const gn = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gn.gain.value = 0
  osc.connect(gn).connect(c.destination)
  const now = c.currentTime
  gn.gain.linearRampToValueAtTime(gain, now + 0.005)
  gn.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000)
  osc.start(now)
  osc.stop(now + durMs / 1000 + 0.02)
}

export function playClick() {
  tone(700, 60, 'square', 0.04)
}

export function playSave() {
  tone(660, 80, 'sine', 0.05)
  setTimeout(() => tone(880, 100, 'sine', 0.05), 60)
}

export function playChime() {
  // C-E-G chord arpeggio
  tone(523.25, 180, 'sine', 0.07)
  setTimeout(() => tone(659.25, 180, 'sine', 0.07), 90)
  setTimeout(() => tone(783.99, 240, 'sine', 0.07), 180)
}

export function playError() {
  tone(220, 180, 'sawtooth', 0.04)
}
