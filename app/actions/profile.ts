'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type ProfileResult =
  | { ok: true }
  | { ok: false; error: string }

export async function updateDisplayName(name: string): Promise<ProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }

  const trimmed = name.trim()
  if (trimmed.length < 2) return { ok: false, error: 'name_too_short' }
  if (trimmed.length > 24) return { ok: false, error: 'name_too_long' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/profile')
  revalidatePath('/home')
  revalidatePath('/ranking')
  return { ok: true }
}

export async function updateAvatarPreset(preset: number): Promise<ProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no_auth' }
  const p = Math.floor(preset)
  if (!Number.isFinite(p) || p < 0 || p > 11) return { ok: false, error: 'invalid_preset' }
  const { error } = await supabase.from('profiles').update({ avatar_preset: p }).eq('id', user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/profile'); revalidatePath('/home'); revalidatePath('/ranking'); revalidatePath('/pools')
  return { ok: true }
}

export async function setLocale(loc: 'es' | 'en'): Promise<ProfileResult> {
  if (loc !== 'es' && loc !== 'en') return { ok: false, error: 'invalid_locale' }
  const ck = await cookies()
  ck.set('NEXT_LOCALE', loc, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ locale: loc }).eq('id', user.id)
  }
  revalidatePath('/')
  return { ok: true }
}

export async function setThemePref(theme: 'dark' | 'light'): Promise<ProfileResult> {
  if (theme !== 'dark' && theme !== 'light') return { ok: false, error: 'invalid_theme' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ theme_pref: theme }).eq('id', user.id)
  }
  revalidatePath('/')
  return { ok: true }
}
