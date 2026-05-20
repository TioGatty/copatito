// scripts/seed-matches.ts
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FixtureGroup { name: string }
interface FixtureTeam {
  name: string
  code: string
  flag_emoji: string
  group: string
}
interface FixtureMatch {
  match_number: number
  phase: string
  home_code?: string
  away_code?: string
  home_placeholder?: string
  away_placeholder?: string
  venue: string
  city: string
  kickoff_at: string
}
interface Fixture {
  groups: FixtureGroup[]
  teams: FixtureTeam[]
  matches: FixtureMatch[]
}

async function main() {
  const fixturePath = path.join(__dirname, 'seed-data', 'wc2026.json')
  const fixture: Fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

  // 1. Upsert groups
  console.log('Seeding groups...')
  const { data: groupRows, error: groupErr } = await supabase
    .from('groups')
    .upsert(fixture.groups.map(g => ({ name: g.name })), { onConflict: 'name' })
    .select()
  if (groupErr) throw groupErr
  console.log(`  ${groupRows?.length} groups`)

  // Build group name → id map
  const groupMap = Object.fromEntries((groupRows ?? []).map(g => [g.name, g.id]))

  // 2. Upsert teams
  console.log('Seeding teams...')
  const { data: teamRows, error: teamErr } = await supabase
    .from('teams')
    .upsert(
      fixture.teams.map(t => ({
        name: t.name,
        code: t.code,
        flag_emoji: t.flag_emoji,
        group_id: groupMap[t.group] ?? null,
      })),
      { onConflict: 'code' }
    )
    .select()
  if (teamErr) throw teamErr
  console.log(`  ${teamRows?.length} teams`)

  // Build team code → id map
  const teamMap = Object.fromEntries((teamRows ?? []).map(t => [t.code, t.id]))

  // 3. Upsert matches
  console.log('Seeding matches...')
  const { data: matchRows, error: matchErr } = await supabase
    .from('matches')
    .upsert(
      fixture.matches.map(m => ({
        match_number: m.match_number,
        phase: m.phase,
        home_team_id: m.home_code ? (teamMap[m.home_code] ?? null) : null,
        away_team_id: m.away_code ? (teamMap[m.away_code] ?? null) : null,
        home_placeholder: m.home_placeholder ?? null,
        away_placeholder: m.away_placeholder ?? null,
        venue: m.venue,
        city: m.city,
        kickoff_at: m.kickoff_at,
        status: 'scheduled',
      })),
      { onConflict: 'match_number' }
    )
    .select()
  if (matchErr) throw matchErr
  console.log(`  ${matchRows?.length} matches`)

  console.log('Done!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
