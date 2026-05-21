// app/api/cron/sync-matches/route.ts
// Sync match scores from API-Football. Called by Vercel Cron.
//
// Env vars required:
//   CRON_SECRET            — header-validated secret
//   API_FOOTBALL_KEY       — api-sports.io key (free tier: 100 req/day)
//   API_FOOTBALL_LEAGUE_ID — typically 1 (World Cup)
//   API_FOOTBALL_SEASON    — e.g. 2026
//
// Vercel cron config in vercel.json:
//   { "crons": [{ "path": "/api/cron/sync-matches", "schedule": "*/30 * * * *" }] }
//
// To map fixtures to our DB, matches.api_football_id must be populated.
// Use admin/sync-mapping endpoint (below) to bulk-map by kickoff_at + team codes.

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authOk } from '@/lib/auth/cron'

export const dynamic = 'force-dynamic'

interface ApiFootballFixture {
  fixture: { id: number; date: string; status: { short: string } }
  goals: { home: number | null; away: number | null }
  teams: { home: { id: number; name: string }; away: { id: number; name: string } }
}

function mapStatus(s: string | undefined): 'scheduled' | 'live' | 'finished' {
  switch (s) {
    case '1H': case '2H': case 'HT': case 'ET': case 'BT': case 'P': case 'LIVE':
      return 'live'
    case 'FT': case 'AET': case 'PEN':
      return 'finished'
    default:
      return 'scheduled'
  }
}

export async function GET(request: Request) {
  if (!authOk(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.API_FOOTBALL_KEY
  const league = process.env.API_FOOTBALL_LEAGUE_ID ?? '1'
  const season = process.env.API_FOOTBALL_SEASON ?? '2026'

  if (!apiKey) {
    return NextResponse.json({ ok: true, skipped: 'no_api_key' })
  }

  let fixtures: ApiFootballFixture[] = []
  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
    )
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `api_${res.status}` }, { status: 502 })
    }
    const data = await res.json()
    fixtures = (data?.response ?? []) as ApiFootballFixture[]
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'fetch_failed', detail: String(e) }, { status: 502 })
  }

  const supabase = createAdminClient()
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const f of fixtures) {
    const fixtureId = f.fixture?.id
    if (!fixtureId) { skipped++; continue }
    const status = mapStatus(f.fixture?.status?.short)
    const homeScore = f.goals?.home ?? null
    const awayScore = f.goals?.away ?? null

    const { error, data } = await supabase
      .from('matches')
      .update({ status, home_score: homeScore, away_score: awayScore })
      .eq('api_football_id', fixtureId)
      .select('id')
    if (error) errors.push(`${fixtureId}: ${error.message}`)
    else if (data && data.length > 0) updated++
    else skipped++
  }

  return NextResponse.json({
    ok: true,
    fetched: fixtures.length,
    updated,
    skipped,
    errors: errors.length ? errors : undefined,
  })
}
