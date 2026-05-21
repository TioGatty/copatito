-- ═══ COINS ═══════════════════════════════════════════════════
alter table profiles
  add column if not exists coins int not null default 100,
  add column if not exists last_daily_bonus_at timestamptz,
  add column if not exists current_streak int not null default 0,
  add column if not exists display_name text;

-- Backfill display_name from email prefix for existing users
update profiles p
   set display_name = split_part(u.email, '@', 1)
  from auth.users u
 where u.id = p.id and p.display_name is null;

-- Update handle_new_user to seed display_name
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name)
    values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;


-- Allow self insert on profiles (for new users seeded by trigger - already exists, but for completeness)
-- handle_new_user already inserts profile with defaults

-- ─── Coin transactions (audit log) ────────────────────────────
create table if not exists coin_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      int  not null,
  reason      text not null check (reason in (
                'initial_grant','prediction_hit','prediction_exact',
                'daily_bonus','streak_bonus','create_pool','admin_adjust'
              )),
  ref_id      uuid,
  created_at  timestamptz not null default now()
);
create index on coin_transactions (user_id, created_at desc);

alter table coin_transactions enable row level security;
create policy "own tx read" on coin_transactions
  for select to authenticated using (auth.uid() = user_id);

-- ─── Coin helpers ─────────────────────────────────────────────
create or replace function award_coins(p_user uuid, p_amount int, p_reason text, p_ref uuid default null)
returns void language plpgsql security definer as $$
begin
  insert into coin_transactions (user_id, amount, reason, ref_id)
  values (p_user, p_amount, p_reason, p_ref);
  update profiles set coins = coins + p_amount where id = p_user;
end;
$$;

-- ─── Auto-award on prediction points ─────────────────────────
-- +1 if any points, +5 extra if exact score
create or replace function award_coins_on_prediction()
returns trigger language plpgsql security definer as $$
declare
  m matches%rowtype;
  is_exact boolean;
begin
  if new.points is not null and (old.points is null or old.points <> new.points) then
    if new.points > 0 then
      perform award_coins(new.user_id, 1, 'prediction_hit', new.id);
      select * into m from matches where id = new.match_id;
      is_exact := (m.home_score = new.home_score and m.away_score = new.away_score);
      if is_exact then
        perform award_coins(new.user_id, 5, 'prediction_exact', new.id);
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_award_coins_on_prediction on predictions;
create trigger trg_award_coins_on_prediction
  after update on predictions
  for each row execute function award_coins_on_prediction();

-- ─── Daily bonus RPC ──────────────────────────────────────────
create or replace function claim_daily_bonus()
returns table (granted boolean, amount int, new_balance int)
language plpgsql security definer as $$
declare
  p profiles%rowtype;
  bonus int := 5;
begin
  select * into p from profiles where id = auth.uid() for update;
  if p.last_daily_bonus_at is not null and p.last_daily_bonus_at > now() - interval '20 hours' then
    return query select false, 0, p.coins;
    return;
  end if;
  perform award_coins(auth.uid(), bonus, 'daily_bonus');
  update profiles set last_daily_bonus_at = now() where id = auth.uid();
  select * into p from profiles where id = auth.uid();
  return query select true, bonus, p.coins;
end;
$$;

-- ═══ POOLS ════════════════════════════════════════════════════
create table if not exists pools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 3 and 40),
  code        text not null unique,
  creator_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index on pools (creator_id);

create table if not exists pool_members (
  id         uuid primary key default gen_random_uuid(),
  pool_id    uuid not null references pools(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique (pool_id, user_id)
);
create index on pool_members (user_id);
create index on pool_members (pool_id);

-- ─── Pool code generator (6 chars, no ambiguous) ─────────────
create or replace function gen_pool_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code     text;
  attempt  int := 0;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (select 1 from pools where pools.code = code) then
      return code;
    end if;
    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'code_generation_failed';
    end if;
  end loop;
end;
$$;

-- ─── Create pool RPC ──────────────────────────────────────────
create or replace function create_pool(p_name text)
returns table (id uuid, name text, code text)
language plpgsql security definer as $$
declare
  uid    uuid := auth.uid();
  p      profiles%rowtype;
  owned  int;
  new_id uuid;
  new_code text;
begin
  if uid is null then raise exception 'no_auth'; end if;
  if char_length(trim(p_name)) < 3 then raise exception 'name_too_short'; end if;
  if char_length(trim(p_name)) > 40 then raise exception 'name_too_long'; end if;

  select * into p from profiles where profiles.id = uid for update;
  if p.coins < 10 then raise exception 'insufficient_coins'; end if;

  select count(*) into owned from pools where creator_id = uid;
  if owned >= 5 then raise exception 'pool_limit_reached'; end if;

  new_code := gen_pool_code();
  insert into pools (name, code, creator_id) values (trim(p_name), new_code, uid)
    returning pools.id into new_id;
  insert into pool_members (pool_id, user_id) values (new_id, uid);
  -- debit coins
  update profiles set coins = coins - 10 where profiles.id = uid;
  insert into coin_transactions (user_id, amount, reason, ref_id)
    values (uid, -10, 'create_pool', new_id);

  return query select new_id, trim(p_name), new_code;
end;
$$;

-- ─── Join pool RPC ────────────────────────────────────────────
create or replace function join_pool(p_code text)
returns table (id uuid, name text)
language plpgsql security definer as $$
declare
  uid   uuid := auth.uid();
  pl    pools%rowtype;
begin
  if uid is null then raise exception 'no_auth'; end if;
  select * into pl from pools where pools.code = upper(trim(p_code));
  if not found then raise exception 'pool_not_found'; end if;
  if exists (select 1 from pool_members where pool_id = pl.id and user_id = uid) then
    raise exception 'already_member';
  end if;
  insert into pool_members (pool_id, user_id) values (pl.id, uid);
  return query select pl.id, pl.name;
end;
$$;

-- ─── RLS for pools / members ─────────────────────────────────
alter table pools enable row level security;
alter table pool_members enable row level security;

-- Members can read pools they're in. Creator always.
create policy "pool read members" on pools
  for select to authenticated
  using (
    creator_id = auth.uid()
    or exists (
      select 1 from pool_members
       where pool_id = pools.id and user_id = auth.uid()
    )
  );

-- Anyone can read a pool by code (needed for join preview) — restrict to code lookup via RPC instead.
-- No insert/update/delete policies → only via RPCs (security definer).

create policy "pool_members read self pool" on pool_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from pool_members pm2
       where pm2.pool_id = pool_members.pool_id and pm2.user_id = auth.uid()
    )
  );

-- Allow user to leave (delete own membership). Creator cannot leave own pool.
create policy "leave pool" on pool_members
  for delete to authenticated
  using (
    user_id = auth.uid()
    and not exists (
      select 1 from pools p where p.id = pool_members.pool_id and p.creator_id = auth.uid()
    )
  );

-- Allow pool co-members to read each other's profiles (for rankings)
create policy "pool comembers profile read" on profiles
  for select to authenticated
  using (
    exists (
      select 1
        from pool_members me
        join pool_members them on them.pool_id = me.pool_id
       where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

-- ═══ PREDICTIONS VISIBILITY EXTENSION ════════════════════════
-- Members of a shared pool can see each others' predictions, BUT only after kickoff.
create policy "shared pool predictions read" on predictions
  for select to authenticated
  using (
    -- already covered by 'own predictions read', this is additional
    user_id <> auth.uid()
    and exists (
      select 1
        from pool_members me
        join pool_members them on them.pool_id = me.pool_id
        join matches m on m.id = predictions.match_id
       where me.user_id  = auth.uid()
         and them.user_id = predictions.user_id
         and m.kickoff_at <= now()
    )
  );
