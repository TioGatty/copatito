-- ═══ FRIEND INVITES ═════════════════════════════════════════
-- profiles.referral_code: unique 6-char invite code per user
alter table profiles
  add column if not exists referral_code text unique;

-- Generator (same alphabet as pools, no ambiguous chars)
create or replace function gen_referral_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code text;
  attempt  int := 0;
begin
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (select 1 from profiles p where p.referral_code = new_code) then
      return new_code;
    end if;
    attempt := attempt + 1;
    if attempt > 20 then raise exception 'ref_code_gen_failed'; end if;
  end loop;
end;
$$;

-- Backfill existing profiles
update profiles set referral_code = gen_referral_code()
 where referral_code is null;

-- Make column NOT NULL after backfill
alter table profiles alter column referral_code set not null;

-- Update handle_new_user to also generate referral_code
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  v_name text;
  v_ref  text;
begin
  v_name := coalesce(nullif(split_part(coalesce(new.email,''), '@', 1), ''), 'Jugador');
  v_ref  := gen_referral_code();

  insert into profiles (id, display_name, coins, avatar_preset, locale, theme_pref, referral_code)
    values (new.id, v_name, 100, 0, 'es', 'dark', v_ref)
  on conflict (id) do update set referral_code = excluded.referral_code
    where profiles.referral_code is null;

  insert into coin_transactions (user_id, amount, reason)
    select new.id, 100, 'initial_grant'
     where not exists (
       select 1 from coin_transactions
        where user_id = new.id and reason = 'initial_grant'
     );

  return new;
end;
$$;

-- ─── Referrals table ─────────────────────────────────────────
create table if not exists referrals (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid not null references auth.users(id) on delete cascade,
  referred_id  uuid not null unique references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);
create index on referrals (referrer_id);

alter table referrals enable row level security;

create policy "own referrals read" on referrals
  for select to authenticated
  using (referrer_id = auth.uid() or referred_id = auth.uid());

-- ─── Coin reason: referral ───────────────────────────────────
-- coin_transactions check already allows several reasons. Extend:
alter table coin_transactions drop constraint if exists coin_transactions_reason_check;
alter table coin_transactions add constraint coin_transactions_reason_check
  check (reason in (
    'initial_grant','prediction_hit','prediction_exact',
    'daily_bonus','streak_bonus','create_pool','admin_adjust',
    'referral_bonus'
  ));

-- ─── Claim referral RPC ──────────────────────────────────────
-- Called after signup once. Validates code, prevents self/double, awards +20 both.
create or replace function claim_referral(p_code text)
returns table (granted boolean, code_match boolean)
language plpgsql security definer as $$
declare
  uid       uuid := auth.uid();
  ref_id    uuid;
  bonus     int  := 20;
begin
  if uid is null then return query select false, false; return; end if;

  select id into ref_id from profiles
   where referral_code = upper(trim(p_code))
   limit 1;
  if ref_id is null then return query select false, false; return; end if;
  if ref_id = uid then return query select false, true; return; end if;

  -- Block double-claim
  if exists (select 1 from referrals where referred_id = uid) then
    return query select false, true; return;
  end if;

  insert into referrals (referrer_id, referred_id) values (ref_id, uid);

  -- Award both
  update profiles set coins = coins + bonus where id = uid;
  insert into coin_transactions (user_id, amount, reason, ref_id) values (uid, bonus, 'referral_bonus', ref_id);

  update profiles set coins = coins + bonus where id = ref_id;
  insert into coin_transactions (user_id, amount, reason, ref_id) values (ref_id, bonus, 'referral_bonus', uid);

  return query select true, true;
end;
$$;
