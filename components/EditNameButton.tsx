'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateDisplayName } from '@/app/actions/profile'

export default function EditNameButton({ currentName }: { currentName: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function submit() {
    setErr(null)
    start(async () => {
      const r = await updateDisplayName(name)
      if (r.ok) { setOpen(false); router.refresh() }
      else setErr(translate(r.error))
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => { setName(currentName); setOpen(true) }}
        aria-label="Editar nombre"
        style={{
          padding: 6, marginLeft: 8, borderRadius: 999,
          background: 'transparent', border: '0.5px solid var(--line-soft)',
          color: 'var(--t-3)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M14 4l6 6L8 22H2v-6L14 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      </button>
    )
  }

  return (
    <div onClick={() => setOpen(false)} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'oklch(0 0 0 / 0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, background: 'var(--bg-1)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 12px' }}/>
        <h2 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>
          Cambiar nombre
        </h2>
        <input
          autoFocus
          value={name}
          maxLength={24}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          style={{
            width: '100%', height: 48, padding: '0 14px',
            background: 'var(--bg-2)', border: '0.5px solid var(--line)', borderRadius: 12,
            color: 'var(--t-1)', fontFamily: 'inherit', fontSize: 15, outline: 'none',
            marginBottom: 14,
          }}
        />
        {err && (
          <div style={{ padding: 10, borderRadius: 10, background: 'oklch(0.3 0.1 25 / 0.3)', color: 'var(--lose)', fontSize: 13, marginBottom: 12 }}>
            {err}
          </div>
        )}
        <button
          onClick={submit}
          disabled={pending || name.trim().length < 2}
          style={{
            width: '100%', height: 52,
            background: name.trim().length >= 2 ? 'var(--gold)' : 'var(--bg-3)',
            color: name.trim().length >= 2 ? 'var(--btn-primary-text)' : 'var(--t-4)',
            border: 'none', borderRadius: 14,
            fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

function translate(e: string): string {
  switch (e) {
    case 'no_auth': return 'Sesión expirada.'
    case 'name_too_short': return 'Mínimo 2 caracteres.'
    case 'name_too_long': return 'Máximo 24 caracteres.'
    default: return e
  }
}
