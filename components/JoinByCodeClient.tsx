'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinPool } from '@/app/actions/pools'

const ERRORS: Record<string, string> = {
  no_auth: 'Sesión expirada.',
  pool_not_found: 'Código no encontrado.',
  already_member: 'Ya sos miembro de ese pool.',
  invalid_code: 'Código inválido (6 caracteres).',
}

export default function JoinByCodeClient({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function submit() {
    setErr(null)
    start(async () => {
      const r = await joinPool(code)
      if (r.ok) router.push(`/pools/${r.data.id}`)
      else setErr(ERRORS[r.error] ?? r.error)
    })
  }

  useEffect(() => {
    if (initialCode.length === 6) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen-body" style={{ padding: '20px' }}>
      <h1 className="display" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
        Unirme a pool
      </h1>
      <div style={{ fontSize: 13, color: 'var(--t-3)', marginBottom: 20 }}>
        Con código <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em' }}>{code}</span>
      </div>
      {err && (
        <div style={{ padding: 12, borderRadius: 10, background: 'oklch(0.3 0.1 25 / 0.3)', color: 'var(--lose)', fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}
      <button
        onClick={submit}
        disabled={pending || code.length !== 6}
        style={{
          width: '100%', height: 52,
          background: 'var(--gold)', color: 'var(--btn-primary-text)',
          border: 'none', borderRadius: 14,
          fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
          cursor: pending ? 'not-allowed' : 'pointer',
        }}
      >
        {pending ? 'Uniendo…' : 'Unirme'}
      </button>
    </div>
  )
}
