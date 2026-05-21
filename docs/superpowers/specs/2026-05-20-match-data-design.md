# Match Data Design

## Goal

Populate the CopaTío app with the full FIFA World Cup 2026 fixture (104 matches, 48 teams, 12 groups) and provide a mechanism to enter results, with a hook for automated API sync in the future.

## Architecture

Static JSON seed for the fixture loaded via a one-time script. Results entered manually by an admin user through a protected page. An API sync route is stubbed out for future automation via Vercel Cron + API-Football.

## Tech Stack

- Supabase (PostgreSQL) for storage
- TypeScript seed script (`npx tsx`)
- Next.js App Router for admin UI and sync route
- API-Football (future, not in scope for this plan)

---

## Database Schema

### `groups`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| name | text | "A" … "L" |

### `teams`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | "Argentina" |
| code | text | "ARG" (3-letter FIFA code) |
| flag_emoji | text | "🇦🇷" |
| group_id | uuid FK → groups | |

### `matches`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| match_number | int | 1–104, unique |
| phase | text | group / round_of_32 / round_of_16 / quarter / semi / third_place / final |
| home_team_id | uuid FK → teams | null for knockout slots |
| away_team_id | uuid FK → teams | null for knockout slots |
| home_placeholder | text | "1° Grupo A" — shown when team_id is null |
| away_placeholder | text | |
| venue | text | stadium name |
| city | text | |
| kickoff_at | timestamptz | |
| home_score | int | null until finished |
| away_score | int | null until finished |
| status | text | scheduled / live / finished |
| api_football_id | int | null — reserved for future sync |

RLS: `matches` and `teams` are readable by all authenticated users. Only `is_admin = true` users (via `profiles` table) can update `home_score`, `away_score`, `status`.

---

## Seed Data

**File:** `scripts/seed-data/wc2026-fixture.json`

Contains:
- 12 groups with 4 teams each (48 teams total, full FIFA 2026 draw)
- 72 group stage matches with real team codes, venues, kickoff times
- 32 knockout matches with placeholder text, venues, kickoff times

**Script:** `scripts/seed-matches.ts`

- Reads the JSON
- Upserts groups, then teams, then matches into Supabase using service role key
- Run once: `npx tsx scripts/seed-matches.ts`
- Safe to re-run (upsert on unique keys)

---

## Admin UI

**Route:** `/admin` (and `/admin/matches`)

**Access control:** `profiles.is_admin = true` — checked server-side in layout, redirects to `/home` if false.

**Functionality:**
- List matches grouped by date
- Inline score inputs for each match
- Save button updates `home_score`, `away_score`, `status = finished`
- No fancy UI needed — functional form is enough

**`profiles` table** (extends Supabase auth.users):
| column | type |
|--------|------|
| id | uuid FK → auth.users |
| is_admin | boolean |

---

## API Sync (stub — future phase)

**Route:** `GET /api/cron/sync-matches`

- Protected by `CRON_SECRET` header
- Calls API-Football v3, maps by `api_football_id`
- Updates `home_score`, `away_score`, `status`
- Vercel Cron: runs every hour during tournament dates

This route is stubbed in this plan (returns 501) and implemented in a separate future plan.

---

## Out of Scope

- Predictions engine (separate plan)
- Pools/groups (separate plan)
- Real-time score updates via Supabase Realtime (separate plan)
- API-Football full integration (separate plan)
