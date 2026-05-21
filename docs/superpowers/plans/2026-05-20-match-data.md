# Match Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the CopaTío Supabase database with all 104 FIFA World Cup 2026 matches, 48 teams, and 12 groups; add a bracket page; add an admin score-entry page; stub a cron sync route.

**Architecture:** Supabase migration creates the tables and RLS. A one-time TypeScript seed script loads a static JSON fixture. A Next.js `/bracket` page displays matches by phase. An `/admin/matches` page lets the admin enter scores. A stub cron route is added for future API-Football sync.

**Tech Stack:** Supabase (PostgreSQL + RLS), Next.js 16 App Router, TypeScript, Tailwind CSS v4, tsx (script runner)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `supabase/migrations/20260520000000_match_data.sql` | Create | Tables: groups, teams, matches, profiles. RLS. Trigger. |
| `lib/types/match.ts` | Create | TypeScript interfaces: Group, Team, Match |
| `lib/supabase/admin.ts` | Create | Supabase client with service role key (server-only) |
| `scripts/seed-data/wc2026.json` | Create | Fixture data: 48 teams, 12 groups, 104 matches |
| `scripts/seed-matches.ts` | Create | Reads JSON, upserts into Supabase via service role |
| `app/(app)/bracket/page.tsx` | Modify | Shows all matches grouped by phase |
| `app/admin/layout.tsx` | Create | Admin auth guard (is_admin check) |
| `app/admin/matches/page.tsx` | Create | Score entry form for today's matches |
| `app/api/cron/sync-matches/route.ts` | Create | Stub — returns 501, reserved for API-Football |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260520000000_match_data.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260520000000_match_data.sql

-- Groups (A–L)
create table if not exists groups (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Teams
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,  -- 3-letter FIFA code e.g. "ARG"
  flag_emoji  text not null,
  group_id    uuid references groups(id) on delete set null
);

-- Matches
create table if not exists matches (
  id                 uuid primary key default gen_random_uuid(),
  match_number       int  not null unique,
  phase              text not null check (phase in (
                       'group','round_of_32','round_of_16',
                       'quarter','semi','third_place','final'
                     )),
  home_team_id       uuid references teams(id),
  away_team_id       uuid references teams(id),
  home_placeholder   text,  -- e.g. "1° Grupo A" — used when team_id is null
  away_placeholder   text,
  venue              text not null,
  city               text not null,
  kickoff_at         timestamptz not null,
  home_score         int,
  away_score         int,
  status             text not null default 'scheduled'
                       check (status in ('scheduled','live','finished')),
  api_football_id    int   -- reserved for future API sync
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table groups   enable row level security;
alter table teams    enable row level security;
alter table matches  enable row level security;
alter table profiles enable row level security;

-- All authenticated users can read
create policy "auth read groups"   on groups   for select to authenticated using (true);
create policy "auth read teams"    on teams    for select to authenticated using (true);
create policy "auth read matches"  on matches  for select to authenticated using (true);
create policy "own profile read"   on profiles for select to authenticated using (auth.uid() = id);

-- Only admins can update match scores
create policy "admin update matches" on matches
  for update to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and is_admin = true
    )
  );
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to: https://supabase.com/dashboard/project/bdqchfcbyehsvghxyykr/sql/new

Paste the full SQL above and click **Run**.

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify tables exist**

In the Supabase Table Editor, confirm these tables appear:
- `groups`
- `teams`
- `matches`
- `profiles`

- [ ] **Step 4: Make yourself admin**

Run this in the SQL editor (replace with your actual user ID from Auth > Users):

```sql
-- First get your user id
select id, email from auth.users;

-- Then set is_admin
update profiles set is_admin = true where id = '<your-user-id>';
```

- [ ] **Step 5: Commit migration file**

```bash
git add supabase/migrations/20260520000000_match_data.sql
git commit -m "feat: add groups/teams/matches/profiles migration"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/types/match.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/types/match.ts

export type Phase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter'
  | 'semi'
  | 'third_place'
  | 'final'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Group {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_id: string | null
}

export interface Match {
  id: string
  match_number: number
  phase: Phase
  home_team_id: string | null
  away_team_id: string | null
  home_placeholder: string | null
  away_placeholder: string | null
  venue: string
  city: string
  kickoff_at: string
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  api_football_id: number | null
  // joined fields
  home_team?: Team | null
  away_team?: Team | null
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/match.ts
git commit -m "feat: add match/team/group TypeScript types"
```

---

## Task 3: Admin Supabase Client

**Files:**
- Create: `lib/supabase/admin.ts`
- Modify: `.env.local`

- [ ] **Step 1: Get service role key**

Go to: https://supabase.com/dashboard/project/bdqchfcbyehsvghxyykr/settings/api

Copy the **service_role** key (under "Project API keys"). It starts with `eyJ...` but is different from the anon key.

- [ ] **Step 2: Add to .env.local**

Add this line to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key-here>
```

- [ ] **Step 3: Create admin client**

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/admin.ts
git commit -m "feat: add admin supabase client (service role)"
```

---

## Task 4: Fixture JSON

**Files:**
- Create: `scripts/seed-data/wc2026.json`

- [ ] **Step 1: Create seed data directory**

```bash
mkdir -p scripts/seed-data
```

- [ ] **Step 2: Create fixture JSON**

The JSON schema is:

```json
{
  "groups": [
    { "name": "A" },
    ...12 groups total (A–L)
  ],
  "teams": [
    {
      "name": "Argentina",
      "code": "ARG",
      "flag_emoji": "🇦🇷",
      "group": "A"
    },
    ...48 teams total
  ],
  "matches": [
    {
      "match_number": 1,
      "phase": "group",
      "home_code": "MEX",
      "away_code": "ARG",
      "venue": "Estadio Azteca",
      "city": "Ciudad de México",
      "kickoff_at": "2026-06-11T20:00:00-06:00"
    },
    {
      "match_number": 73,
      "phase": "round_of_32",
      "home_placeholder": "1° Grupo A",
      "away_placeholder": "2° Grupo B",
      "venue": "MetLife Stadium",
      "city": "East Rutherford",
      "kickoff_at": "2026-07-04T15:00:00-04:00"
    }
  ]
}
```

**Populate the file with the complete 2026 WC fixture:**
- All 48 teams with their actual group assignments
- All 72 group stage matches (use `home_code` / `away_code`)
- All 32 knockout matches (use `home_placeholder` / `away_placeholder`)
- Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-centre

The complete list of 48 qualified teams (codes for reference):

| Group A | Group B | Group C | Group D |
|---------|---------|---------|---------|
| USA     | Mexico  | Canada  | *(verify with FIFA)* |

> Note: Verify all group assignments and match dates/venues against the official FIFA 2026 fixture before running the seed script. The tournament starts June 11, 2026. Kickoff times should use the local timezone of each city.

Venue reference for `city` and `venue` fields:
- SoFi Stadium — Inglewood (Los Angeles)
- Rose Bowl — Pasadena (Los Angeles)
- AT&T Stadium — Arlington (Dallas)
- Levi's Stadium — Santa Clara (San Francisco)
- Arrowhead Stadium — Kansas City
- Allegiant Stadium — Las Vegas
- MetLife Stadium — East Rutherford (New York/New Jersey)
- Lincoln Financial Field — Philadelphia
- Hard Rock Stadium — Miami Gardens (Miami)
- Gillette Stadium — Foxborough (Boston)
- BC Place — Vancouver
- BMO Field — Toronto
- Estadio Azteca — Ciudad de México
- Estadio BBVA — Monterrey
- Estadio Akron — Guadalajara

- [ ] **Step 3: Commit fixture JSON**

```bash
git add scripts/seed-data/wc2026.json
git commit -m "feat: add WC 2026 fixture seed data (48 teams, 104 matches)"
```

---

## Task 5: Seed Script

**Files:**
- Create: `scripts/seed-matches.ts`
- Modify: `package.json`

- [ ] **Step 1: Add tsx dev dependency**

```bash
npm install --save-dev tsx
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add to `"scripts"`:

```json
"seed": "tsx scripts/seed-matches.ts"
```

- [ ] **Step 3: Create seed script**

```typescript
// scripts/seed-matches.ts
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
```

- [ ] **Step 4: Run seed script**

```bash
npm run seed
```

Expected output:
```
Seeding groups...
  12 groups
Seeding teams...
  48 teams
Seeding matches...
  104 matches
Done!
```

If you see a `missing env variable` error, make sure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` set and run:

```bash
# Load .env.local for the script
npx dotenv -e .env.local -- tsx scripts/seed-matches.ts
```

Or add `import 'dotenv/config'` at the top and install: `npm install --save-dev dotenv`.

- [ ] **Step 5: Verify in Supabase**

Go to: https://supabase.com/dashboard/project/bdqchfcbyehsvghxyykr/editor

Run:
```sql
select count(*) from groups;   -- expect 12
select count(*) from teams;    -- expect 48
select count(*) from matches;  -- expect 104
```

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-matches.ts package.json package-lock.json
git commit -m "feat: add seed script for WC 2026 fixture"
```

---

## Task 6: Bracket Page

**Files:**
- Modify: `app/(app)/bracket/page.tsx`

- [ ] **Step 1: Update bracket page**

```typescript
// app/(app)/bracket/page.tsx
import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/types/match'

const PHASE_LABELS: Record<string, string> = {
  group:       'Fase de Grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarter:     'Cuartos de Final',
  semi:        'Semifinales',
  third_place: 'Tercer Puesto',
  final:       'Final',
}

const PHASE_ORDER = [
  'group','round_of_32','round_of_16','quarter','semi','third_place','final'
]

function MatchCard({ match }: { match: Match }) {
  const home = match.home_team
  const away = match.away_team
  const homeName = home ? `${home.flag_emoji} ${home.code}` : match.home_placeholder ?? '?'
  const awayName = away ? `${away.flag_emoji} ${away.code}` : match.away_placeholder ?? '?'
  const date = new Date(match.kickoff_at).toLocaleDateString('es', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-2">
      <span className="text-sm font-medium w-20 text-right truncate">{homeName}</span>
      <div className="flex items-center gap-1 text-sm font-bold min-w-[3rem] justify-center">
        {match.status === 'finished' ? (
          <span>{match.home_score} – {match.away_score}</span>
        ) : (
          <span className="text-white/40 text-xs">{date}</span>
        )}
      </div>
      <span className="text-sm font-medium w-20 truncate">{awayName}</span>
    </div>
  )
}

export default async function BracketPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .order('match_number')

  if (error) return <p className="p-6 text-red-400">Error cargando partidos</p>

  const byPhase = (matches as Match[]).reduce<Record<string, Match[]>>((acc, m) => {
    acc[m.phase] = acc[m.phase] ?? []
    acc[m.phase].push(m)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Mundial 2026</h1>
      {PHASE_ORDER.filter(p => byPhase[p]?.length).map(phase => (
        <section key={phase}>
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            {PHASE_LABELS[phase]}
          </h2>
          <div className="space-y-2">
            {byPhase[phase].map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3000/bracket — should show matches grouped by phase with team flags and dates.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/bracket/page.tsx
git commit -m "feat: bracket page shows all 104 WC 2026 matches by phase"
```

---

## Task 7: Admin Layout + Score Entry

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/matches/page.tsx`

- [ ] **Step 1: Create admin layout**

```typescript
// app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_60)] text-white">
      <div className="max-w-lg mx-auto p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">ADMIN</span>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create score entry page**

```typescript
// app/admin/matches/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Match } from '@/lib/types/match'

async function saveScore(formData: FormData) {
  'use server'
  const matchId = formData.get('matchId') as string
  const homeScore = parseInt(formData.get('homeScore') as string)
  const awayScore = parseInt(formData.get('awayScore') as string)

  if (isNaN(homeScore) || isNaN(awayScore)) return

  const admin = createAdminClient()
  await admin
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
    .eq('id', matchId)

  revalidatePath('/admin/matches')
  revalidatePath('/bracket')
}

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  // Show today's matches + recent unfinished
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .or(`kickoff_at.gte.${today.toISOString()},status.eq.live`)
    .lt('kickoff_at', tomorrow.toISOString())
    .order('kickoff_at')

  const all = (matches ?? []) as Match[]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Cargar Resultados</h1>
      <p className="text-white/50 text-sm">Partidos de hoy</p>

      {all.length === 0 && (
        <p className="text-white/40 text-sm">No hay partidos programados para hoy.</p>
      )}

      {all.map(match => {
        const home = match.home_team
        const away = match.away_team
        const homeName = home ? `${home.flag_emoji} ${home.name}` : match.home_placeholder ?? '?'
        const awayName = away ? `${away.flag_emoji} ${away.name}` : match.away_placeholder ?? '?'

        return (
          <form key={match.id} action={saveScore}
            className="bg-white/5 rounded-xl p-4 space-y-3">
            <input type="hidden" name="matchId" value={match.id} />
            <div className="text-sm text-white/60">Partido #{match.match_number}</div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-right text-sm font-medium">{homeName}</span>
              <input
                type="number" name="homeScore" min="0" max="20"
                defaultValue={match.home_score ?? ''}
                className="w-12 text-center bg-white/10 rounded-lg p-2 text-sm"
              />
              <span className="text-white/40">–</span>
              <input
                type="number" name="awayScore" min="0" max="20"
                defaultValue={match.away_score ?? ''}
                className="w-12 text-center bg-white/10 rounded-lg p-2 text-sm"
              />
              <span className="flex-1 text-sm font-medium">{awayName}</span>
            </div>
            <button type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
                         rounded-lg py-2 text-sm transition-colors">
              Guardar resultado
            </button>
          </form>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Test admin page**

1. Open http://localhost:3000/admin/matches
2. Should show today's matches (or "No hay partidos" if none today)
3. Enter a score and click "Guardar resultado"
4. Reload `/bracket` — match should show the score

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx app/admin/matches/page.tsx
git commit -m "feat: admin matches page for score entry"
```

---

## Task 8: Cron Sync Stub

**Files:**
- Create: `app/api/cron/sync-matches/route.ts`

- [ ] **Step 1: Create stub route**

```typescript
// app/api/cron/sync-matches/route.ts
import { NextResponse } from 'next/server'

// Called by Vercel Cron hourly during the tournament.
// Will sync scores from API-Football when implemented.
export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    { message: 'API-Football sync not yet implemented' },
    { status: 501 }
  )
}
```

- [ ] **Step 2: Add CRON_SECRET to .env.local**

Add to `.env.local`:
```
CRON_SECRET=changeme-local-dev
```

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/sync-matches/route.ts
git commit -m "feat: stub cron route for future API-Football sync"
```

---

## Self-Review

**Spec coverage:**
- ✅ DB schema: groups, teams, matches, profiles — Task 1
- ✅ Seed JSON + script — Tasks 4 & 5
- ✅ 104 matches (72 group + 32 knockout) — Task 4
- ✅ RLS: authenticated read, admin update — Task 1
- ✅ Admin score entry — Task 7
- ✅ Bracket display page — Task 6
- ✅ Cron stub — Task 8
- ✅ TypeScript types — Task 2
- ✅ Admin Supabase client — Task 3

**Placeholder scan:** No TBD/TODO in code. Fixture JSON data must be populated from FIFA.com (data, not code — acceptable).

**Type consistency:** `Match`, `Team`, `Group` defined in Task 2, used consistently in Tasks 6 and 7. `createAdminClient()` defined in Task 3, used in Task 7.
