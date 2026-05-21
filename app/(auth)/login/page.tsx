'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null)
  const [pending, start] = useTransition()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) {
      setMsg({ kind: 'err', text: 'Completá email y contraseña.' })
      return
    }
    if (password.length < 8) {
      setMsg({ kind: 'err', text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    start(async () => {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMsg({ kind: 'err', text: translate(error.message) })
          return
        }
        window.location.href = '/home'
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) {
          setMsg({ kind: 'err', text: translate(error.message) })
          return
        }
        // If email confirmation is OFF, user is signed in. If ON, need email click.
        if (data.session) {
          window.location.href = '/home'
        } else {
          setMsg({ kind: 'ok', text: 'Cuenta creada. Revisá tu email para confirmar.' })
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_60)] flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-white mb-2">CopaTío</h1>
      <p className="text-[oklch(0.6_0.05_60)] mb-10 text-sm">Mundial 2026 · Predicciones</p>

      <button
        onClick={signInWithGoogle}
        className="w-full max-w-sm bg-white text-black font-semibold py-3 px-4 rounded-xl mb-6 flex items-center justify-center gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[oklch(0.25_0.02_60)]" />
          <span className="text-[oklch(0.5_0.03_60)] text-xs">o con email</span>
          <div className="flex-1 h-px bg-[oklch(0.25_0.02_60)]" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            autoCapitalize="none"
            autoComplete="email"
            required
            className="bg-[oklch(0.2_0.02_60)] text-white rounded-xl px-4 py-3 outline-none border border-[oklch(0.3_0.02_60)] focus:border-[oklch(0.82_0.16_80)]"
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Contraseña (mín 8)"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            className="bg-[oklch(0.2_0.02_60)] text-white rounded-xl px-4 py-3 outline-none border border-[oklch(0.3_0.02_60)] focus:border-[oklch(0.82_0.16_80)]"
          />

          {msg && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                msg.kind === 'err'
                  ? 'bg-[oklch(0.3_0.1_25_/_0.3)] text-[oklch(0.7_0.18_25)]'
                  : 'bg-[oklch(0.3_0.1_145_/_0.3)] text-[oklch(0.75_0.15_145)]'
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-[oklch(0.82_0.16_80)] text-[oklch(0.14_0.02_60)] font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {pending ? '…' : mode === 'signin' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null) }}
          className="w-full mt-4 py-3 rounded-xl bg-[oklch(0.22_0.02_60)] hover:bg-[oklch(0.26_0.02_60)] text-[oklch(0.78_0.05_60)] text-sm font-semibold border border-[oklch(0.3_0.02_60)] cursor-pointer"
        >
          {mode === 'signin' ? '¿No tenés cuenta? Crear una' : '¿Ya tenés cuenta? Ingresar'}
        </button>
      </div>
    </div>
  )
}

function translate(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (m.includes('user already registered')) return 'Ese email ya tiene cuenta. Probá ingresar.'
  if (m.includes('email not confirmed')) return 'Confirmá tu email antes de ingresar.'
  if (m.includes('rate limit')) return 'Demasiados intentos. Esperá un momento.'
  if (m.includes('password')) return 'Contraseña inválida (mín 8 caracteres).'
  return msg
}
