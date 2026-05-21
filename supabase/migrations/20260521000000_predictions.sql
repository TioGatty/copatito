-- ─── Predictions ────────────────────────────────────────────
create table if not exists predictions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  match_id              uuid not null references matches(id) on delete cascade,
  home_score            smallint not null check (home_score between 0 and 20),
  away_score            smallint not null check (away_score between 0 and 20),
  tiebreaker_winner_id  uuid references teams(id),
  points                smallint,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, match_id)
);

create index on predictions (user_id);
create index on predictions (match_id);

-- updated_at autoset
create or replace function predictions_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists predictions_updated_at on predictions;
create trigger predictions_updated_at
  before update on predictions
  for each row execute function predictions_set_updated_at();

-- ─── Phase multiplier (×10 to stay integer; divide on read) ──
-- Returns multiplier × 10: group=10, r32=15, r16=20, qtr=25, semi=30, 3rd=20, final=50
create or replace function phase_multiplier_x10(p text)
returns int language sql immutable as $$
  select case p
    when 'group'        then 10
    when 'round_of_32'  then 15
    when 'round_of_16'  then 20
    when 'quarter'      then 25
    when 'semi'         then 30
    when 'third_place'  then 20
    when 'final'        then 50
    else 10
  end;
$$;

-- ─── Calculate points for one prediction ─────────────────────
-- 10 exact / 6 goal-diff / 3 winner. Multiplied by phase factor.
create or replace function calc_prediction_points(pred_id uuid)
returns smallint language plpgsql as $$
declare
  p          predictions%rowtype;
  m          matches%rowtype;
  base_pts   int := 0;
  pred_diff  int;
  real_diff  int;
  mult_x10   int;
begin
  select * into p from predictions where id = pred_id;
  if not found then return null; end if;

  select * into m from matches where id = p.match_id;
  if m.status <> 'finished' or m.home_score is null or m.away_score is null then
    return null;
  end if;

  pred_diff := p.home_score - p.away_score;
  real_diff := m.home_score - m.away_score;

  if p.home_score = m.home_score and p.away_score = m.away_score then
    base_pts := 10;
  elsif pred_diff = real_diff then
    base_pts := 6;
  elsif sign(pred_diff) = sign(real_diff) then
    base_pts := 3;
  else
    base_pts := 0;
  end if;

  mult_x10 := phase_multiplier_x10(m.phase);
  return (base_pts * mult_x10 / 10)::smallint;
end;
$$;

-- ─── Recalculate all predictions for a match ─────────────────
create or replace function recalc_match_predictions(m_id uuid)
returns void language plpgsql as $$
begin
  update predictions
     set points = calc_prediction_points(id)
   where match_id = m_id;
end;
$$;

-- ─── Trigger: on match finalize, recalc all predictions ──────
create or replace function on_match_finished()
returns trigger language plpgsql as $$
begin
  if new.status = 'finished'
     and (old.status is distinct from 'finished'
          or old.home_score is distinct from new.home_score
          or old.away_score is distinct from new.away_score)
  then
    perform recalc_match_predictions(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_match_finished on matches;
create trigger trg_match_finished
  after update on matches
  for each row execute function on_match_finished();

-- ─── RLS ─────────────────────────────────────────────────────
alter table predictions enable row level security;

create policy "own predictions read" on predictions
  for select to authenticated
  using (auth.uid() = user_id);

-- Insert/update only if window open: match scheduled AND now < kickoff - 15min
create policy "own predictions insert" on predictions
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from matches m
       where m.id = match_id
         and m.status = 'scheduled'
         and m.kickoff_at > now() + interval '15 minutes'
         and m.home_team_id is not null
         and m.away_team_id is not null
    )
    and points is null
    and (
      -- tiebreaker only for knockout AND only when scores tied
      tiebreaker_winner_id is null
      or (
        home_score = away_score
        and exists (
          select 1 from matches m2
           where m2.id = match_id
             and m2.phase <> 'group'
             and (tiebreaker_winner_id = m2.home_team_id
                  or tiebreaker_winner_id = m2.away_team_id)
        )
      )
    )
  );

create policy "own predictions update" on predictions
  for update to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from matches m
       where m.id = match_id
         and m.status = 'scheduled'
         and m.kickoff_at > now() + interval '15 minutes'
    )
  )
  with check (
    auth.uid() = user_id
    and points is null
    and (
      tiebreaker_winner_id is null
      or (
        home_score = away_score
        and exists (
          select 1 from matches m2
           where m2.id = match_id
             and m2.phase <> 'group'
             and (tiebreaker_winner_id = m2.home_team_id
                  or tiebreaker_winner_id = m2.away_team_id)
        )
      )
    )
  );

-- No delete policy: predictions are immutable once kickoff window closes
