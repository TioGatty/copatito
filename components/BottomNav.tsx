'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/home', label: 'Inicio', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
      <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
    </svg>
  )},
  { href: '/bracket', label: 'Bracket', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <rect x="2" y="16" width="6" height="4" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <rect x="16" y="10" width="6" height="4" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <path d="M8 6h4v8H8M8 18h4v-6" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
      <path d="M16 12h-4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
    </svg>
  )},
  { href: '/pools', label: 'Pools', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
    </svg>
  )},
  { href: '/profile', label: 'Perfil', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <path d="M4 21v-1a8 8 0 0116 0v1" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
    </svg>
  )},
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[oklch(0.16_0.02_60)] border-t border-[oklch(0.22_0.02_60)] flex justify-around items-center h-16 max-w-lg mx-auto px-2 z-50">
      {tabs.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <span style={{ color: active ? 'oklch(0.82 0.16 80)' : 'oklch(0.5 0.03 60)' }}>
              {tab.icon(active)}
            </span>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: active ? 'oklch(0.82 0.16 80)' : 'oklch(0.5 0.03 60)' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
