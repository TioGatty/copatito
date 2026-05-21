'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { leavePool } from '@/app/actions/pools'

export default function PoolLeaveButton({ poolId }: { poolId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function confirmLeave() {
    if (!confirm('¿Salir de este pool? Vas a perder acceso al ranking.')) return
    start(async () => {
      const r = await leavePool(poolId)
      if (r.ok) router.push('/pools')
      else alert(r.error)
    })
  }

  return (
    <button
      onClick={confirmLeave}
      disabled={pending}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'oklch(0.3 0.08 25 / 0.3)',
        border: '0.5px solid oklch(0.4 0.12 25)',
        borderRadius: 12, color: 'var(--lose)',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {pending ? 'Saliendo…' : 'Salir del pool'}
    </button>
  )
}
