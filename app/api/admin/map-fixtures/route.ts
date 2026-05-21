// app/api/admin/map-fixtures/route.ts
// One-shot endpoint: fetch fixtures from API-Football, auto-map to our matches
// by kickoff time (±10 min) when api_football_id is null.
// Run manually after seeding or whenever schedule changes.

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface ApiFootballFixture {
  fixture: { id: number; date: string }
  teams: { home: { id: number; name: string; code: string | null }; away: { id: number; name: string; code: string | null } }
}

function authOk(request: Request): boolean {
  const headerSecret = request.headers.get('x-cron-secret')
  const bearer = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  return headerSecret === expected || bearer === `Bearer ${expected}`
}

export async function POST(request: Request) {
  if (!authOk(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) return NextResponse.json({ error: 'no_api_key' }, { status: 400 })

  const league = process.env.API_FOOTBALL_LEAGUE_ID ?? '1'
  const season = process.env.API_FOOTBALL_SEASON ?? '2026'

  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
    { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
  )
  if (!res.ok) return NextResponse.json({ error: `api_${res.status}` }, { status: 502 })
  const data = await res.json()
  const fixtures = (data?.response ?? []) as ApiFootballFixture[]

  const supabase = createAdminClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('id, kickoff_at, api_football_id')
    .is('api_football_id', null)

  let mapped = 0
  const unmapped: string[] = []

  for (const m of matches ?? []) {
    const mTime = new Date(m.kickoff_at as string).getTime()
    const candidates = fixtures.filter(f => {
      const ft = new Date(f.fixture.date).getTime()
      return Math.abs(ft - mTime) <= 10 * 60 * 1000
    })
    if (candidates.length === 1) {
      const { error } = await supabase
        .from('matches')
        .update({ api_football_id: candidates[0].fixture.id })
        .eq('id', m.id as string)
      if (!error) mapped++
    } else {
      unmapped.push(`${m.id} (${m.kickoff_at}): ${candidates.length} candidates`)
    }
  }

  return NextResponse.json({
    ok: true,
    api_fixtures: fixtures.length,
    db_unmapped: matches?.length ?? 0,
    mapped,
    unmapped_remaining: unmapped.length,
    unmapped_sample: unmapped.slice(0, 5),
  })
}
