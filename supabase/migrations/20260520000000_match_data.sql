-- Groups (A–L)
create table if not exists groups (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Teams
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
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
  home_placeholder   text,
  away_placeholder   text,
  venue              text not null,
  city               text not null,
  kickoff_at         timestamptz not null,
  home_score         int,
  away_score         int,
  status             text not null default 'scheduled'
                       check (status in ('scheduled','live','finished')),
  api_football_id    int
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

create policy "auth read groups"   on groups   for select to authenticated using (true);
create policy "auth read teams"    on teams    for select to authenticated using (true);
create policy "auth read matches"  on matches  for select to authenticated using (true);
create policy "own profile read"   on profiles for select to authenticated using (auth.uid() = id);

create policy "admin update matches" on matches
  for update to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "own profile update" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (
    is_admin = (select is_admin from profiles where id = auth.uid())
  );

-- Constraints
alter table matches add constraint matches_home_score_nonneg check (home_score >= 0 or home_score is null);
alter table matches add constraint matches_away_score_nonneg check (away_score >= 0 or away_score is null);
alter table matches add constraint matches_teams_differ check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id);

-- Indexes
create index on matches (status);
create index on matches (kickoff_at);
create index on matches (phase);
create index on teams (group_id);
create unique index on matches (api_football_id) where api_football_id is not null;
