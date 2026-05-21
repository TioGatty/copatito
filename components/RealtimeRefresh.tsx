'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Subscribe to matches + own predictions changes; debounce router.refresh.
// Mounted once in (app)/layout for global coverage.
export default function RealtimeRefresh() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => router.refresh(), 800)
    }

    const ch = supabase
      .channel('app-realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        schedule
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        schedule
      )
      .subscribe()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      supabase.removeChannel(ch)
    }
  }, [router])

  return null
}
