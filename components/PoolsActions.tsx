'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPool, joinPool } from '@/app/actions/pools'

type Modal = null | 'create' | 'join'

const ERRORS: Record<string, string> = {
  no_auth: 'Sesión expirada.',
  insufficient_coins: 'No tenés monedas suficientes.',
  pool_limit_reached: 'Ya tenés el máximo de 5 pools creados.',
  name_too_short: 'Nombre muy corto (mín 3).',
  name_too_long: 'Nombre muy largo (máx 40).',
  pool_not_found: 'Código no encontrado.',
  already_member: 'Ya sos miembro de ese pool.',
  invalid_code: 'Código inválido (6 caracteres).',
  invalid_cost: 'Costo inválido (0–1000).',
}

function tr(e: string): string {
  return ERRORS[e] ?? e
}

export default function PoolsActions({ coins }: { coins: number }) {
  const [modal, setModal] = useState<Modal>(null)
  const router = useRouter()

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setModal('join')} className="btn" style={{ padding: '8px 12px', fontSize: 12 }}>
          Unirme
        </button>
        <button onClick={() => setModal('create')} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }}>
          + Crear
        </button>
      </div>

      {modal === 'create' && (
        <CreateModal
          coins={coins}
          onClose={() => setModal(null)}
          onCreated={(id) => { setModal(null); router.push(`/pools/${id}`) }}
        />
      )}
      {modal === 'join' && (
        <JoinModal
          coins={coins}
          onClose={() => setModal(null)}
          onJoined={(id) => { setModal(null); router.push(`/pools/${id}`) }}
        />
      )}
    </>
  )
}

function CreateModal({ coins, onClose, onCreated }: {
  coins: number
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState(10)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const canPay = coins >= cost
  const validName = name.trim().length >= 3
  const validCost = cost >= 0 && cost <= 1000

  function submit() {
    setErr(null)
    if (!canPay) { setErr('No tenés monedas suficientes.'); return }
    start(async () => {
      const r = await createPool(name, cost)
      if (r.ok) onCreated(r.data.id)
      else setErr(tr(r.error))
    })
  }

  return (
    <Sheet onClose={onClose} title="Crear pool">
      <Field label="Nombre del pool">
        <input
          autoFocus
          value={name}
          maxLength={40}
          onChange={e => setName(e.target.value)}
          placeholder="Polla del trabajo"
          style={inputStyle}
        />
      </Field>

      <Field label="Costo de entrada (monedas)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setCost(c => Math.max(0, c - 5))}
            style={pmBtn}
          >−</button>
          <input
            type="number"
            value={cost}
            min={0}
            max={1000}
            inputMode="numeric"
            onChange={e => setCost(Math.max(0, Math.min(1000, parseInt(e.target.value || '0', 10))))}
            style={{ ...inputStyle, textAlign: 'center', fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 20, fontWeight: 700 }}
          />
          <button
            type="button"
            onClick={() => setCost(c => Math.min(1000, c + 5))}
            style={pmBtn}
          >+</button>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--t-3)' }}>
          Vos pagás <b>{cost}</b>. Cada miembro paga lo mismo para unirse.
        </div>
      </Field>

      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-2)', fontSize: 13, color: 'var(--t-2)', marginBottom: 16 }}>
        Saldo actual: <span className="mono" style={{ fontWeight: 700, color: canPay ? 'var(--t-1)' : 'var(--lose)' }}>{coins}</span>
      </div>
      {err && <ErrorBanner msg={err}/>}
      <button
        onClick={submit}
        disabled={pending || !canPay || !validName || !validCost}
        style={cta(canPay && validName && validCost)}
      >
        {pending ? 'Creando…' : `Crear pool (-${cost})`}
      </button>
    </Sheet>
  )
}

function JoinModal({ coins, onClose, onJoined }: { coins: number; onClose: () => void; onJoined: (id: string) => void }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

  function submit() {
    setErr(null)
    start(async () => {
      const r = await joinPool(clean)
      if (r.ok) onJoined(r.data.id)
      else setErr(tr(r.error))
    })
  }

  return (
    <Sheet onClose={onClose} title="Unirme a un pool">
      <Field label="Código de invitación">
        <input
          autoFocus
          value={clean}
          onChange={e => setCode(e.target.value)}
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          spellCheck={false}
          style={{ ...inputStyle, letterSpacing: '0.3em', fontFamily: 'var(--font-jetbrains, monospace)', textAlign: 'center', fontSize: 22, fontWeight: 700 }}
        />
      </Field>
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-2)', fontSize: 12, color: 'var(--t-3)', marginBottom: 12 }}>
        El costo lo define el creador. Saldo actual: <span className="mono" style={{ fontWeight: 700, color: 'var(--t-1)' }}>{coins}</span>
      </div>
      {err && <ErrorBanner msg={err}/>}
      <button onClick={submit} disabled={pending || clean.length !== 6} style={cta(clean.length === 6)}>
        {pending ? 'Uniendo…' : 'Unirme'}
      </button>
    </Sheet>
  )
}

function Sheet({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
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
          <h2 className="display" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" style={closeBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--t-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 10, background: 'oklch(0.3 0.1 25 / 0.3)', color: 'var(--lose)', fontSize: 13, marginBottom: 12 }}>
      {msg}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 14px',
  background: 'var(--bg-2)', border: '0.5px solid var(--line)', borderRadius: 12,
  color: 'var(--t-1)', fontFamily: 'inherit', fontSize: 15, outline: 'none',
}

const pmBtn: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 12,
  background: 'var(--gold)', color: 'var(--btn-primary-text)',
  border: 'none', fontSize: 22, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  flexShrink: 0,
}

const closeBtn: React.CSSProperties = {
  background: 'var(--bg-3)', border: 'none', borderRadius: 999,
  width: 32, height: 32, color: 'var(--t-2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const cta = (enabled: boolean): React.CSSProperties => ({
  width: '100%', height: 52,
  background: enabled ? 'var(--gold)' : 'var(--bg-3)',
  color: enabled ? 'var(--btn-primary-text)' : 'var(--t-4)',
  border: 'none', borderRadius: 14,
  fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
  cursor: enabled ? 'pointer' : 'not-allowed',
  WebkitTapHighlightColor: 'transparent',
})
