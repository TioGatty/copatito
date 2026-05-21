'use client'

import { useEffect } from 'react'

// Syncs server-known theme preference into localStorage + document.
// Runs once on mount per page navigation.
export default function ThemeSync({ themePref }: { themePref: 'dark' | 'light' }) {
  useEffect(() => {
    try {
      const current = localStorage.getItem('copatio-theme')
      if (current !== themePref) {
        localStorage.setItem('copatio-theme', themePref)
      }
      if (document.documentElement.dataset.theme !== themePref) {
        document.documentElement.dataset.theme = themePref
      }
    } catch {}
  }, [themePref])
  return null
}
