-- ═══ ACHIEVEMENTS ════════════════════════════════════════════
create table if not exists user_achievements (
  user_id      uuid not null references auth.users(id) on delete cascade,
  code         text not null,
  unlocked_at  timestamptz not null default now(),
  primary key (user_id, code)
);
create index on user_achievements (user_id);

alter table user_achievements enable row level security;

create policy "own achievements read" on user_achievements
  for select to authenticated
  using (user_id = auth.uid());

create policy "pool comembers achievements read" on user_achievements
  for select to authenticated
  using (are_pool_comembers(auth.uid(), user_id));

-- ─── add_ach helper (must exist before check_achievements) ────
create or replace function add_ach(p_user uuid, p_code text)
returns int language plpgsql security definer as $$
declare result int := 0;
begin
  insert into user_achievements (user_id, code) values (p_user, p_code)
  on conflict do nothing
  returning 1 into result;
  return coalesce(result, 0);
end;
$$;

-- ─── Evaluator: checks conditions and inserts unlocks ─────────
create or replace function check_achievements(p_user uuid)
returns int language plpgsql security definer as $$
declare
  total_preds   int;
  total_hits    int;
  total_exact   int;
  total_points  int;
  total_pools_owned int;
  total_pools_member int;
  total_referrals int;
  accuracy      numeric;
  unlocked      int := 0;
begin
  select count(*), count(*) filter (where points > 0),
         count(*) filter (where exists (
           select 1 from matches m
            where m.id = predictions.match_id
              and m.status='finished'
              and m.home_score = predictions.home_score
              and m.away_score = predictions.away_score
         )),
         coalesce(sum(points), 0)
    into total_preds, total_hits, total_exact, total_points
    from predictions where user_id = p_user;

  select count(*) into total_pools_owned from pools where creator_id = p_user;
  select count(*) into total_pools_member from pool_members where user_id = p_user;
  select count(*) into total_referrals from referrals where referrer_id = p_user;

  accuracy := case when total_preds > 0 then (total_hits::numeric / total_preds) * 100 else 0 end;

  if total_preds >= 1   then unlocked := unlocked + add_ach(p_user, 'first_prediction'); end if;
  if total_preds >= 10  then unlocked := unlocked + add_ach(p_user, 'ten_predictions'); end if;
  if total_preds >= 50  then unlocked := unlocked + add_ach(p_user, 'fifty_predictions'); end if;
  if total_preds >= 100 then unlocked := unlocked + add_ach(p_user, 'all_in'); end if;

  if total_hits >= 1  then unlocked := unlocked + add_ach(p_user, 'first_hit'); end if;
  if total_hits >= 10 then unlocked := unlocked + add_ach(p_user, 'ten_hits'); end if;
  if total_hits >= 25 then unlocked := unlocked + add_ach(p_user, 'twenty_five_hits'); end if;

  if total_exact >= 1  then unlocked := unlocked + add_ach(p_user, 'first_exact'); end if;
  if total_exact >= 5  then unlocked := unlocked + add_ach(p_user, 'five_exact'); end if;
  if total_exact >= 15 then unlocked := unlocked + add_ach(p_user, 'oracle'); end if;

  if total_points >= 50  then unlocked := unlocked + add_ach(p_user, 'fifty_points'); end if;
  if total_points >= 100 then unlocked := unlocked + add_ach(p_user, 'hundred_points'); end if;
  if total_points >= 300 then unlocked := unlocked + add_ach(p_user, 'three_hundred_points'); end if;

  if total_preds >= 10 and accuracy >= 50 then unlocked := unlocked + add_ach(p_user, 'accuracy_50'); end if;
  if total_preds >= 20 and accuracy >= 70 then unlocked := unlocked + add_ach(p_user, 'accuracy_70'); end if;

  if total_pools_owned  >= 1 then unlocked := unlocked + add_ach(p_user, 'pool_creator'); end if;
  if total_pools_member >= 2 then unlocked := unlocked + add_ach(p_user, 'pool_social'); end if;

  if total_referrals >= 1 then unlocked := unlocked + add_ach(p_user, 'first_referral'); end if;
  if total_referrals >= 5 then unlocked := unlocked + add_ach(p_user, 'connector'); end if;

  return unlocked;
end;
$$;

-- ─── Triggers ────────────────────────────────────────────────
create or replace function tg_check_achievements_pred()
returns trigger language plpgsql security definer as $$
begin
  perform check_achievements(new.user_id);
  return new;
end;
$$;
drop trigger if exists trg_check_ach_pred on predictions;
create trigger trg_check_ach_pred
  after insert or update on predictions
  for each row execute function tg_check_achievements_pred();

create or replace function tg_check_achievements_pool()
returns trigger language plpgsql security definer as $$
begin
  perform check_achievements(new.user_id);
  return new;
end;
$$;
drop trigger if exists trg_check_ach_pool on pool_members;
create trigger trg_check_ach_pool
  after insert on pool_members
  for each row execute function tg_check_achievements_pool();

create or replace function tg_check_achievements_ref()
returns trigger language plpgsql security definer as $$
begin
  perform check_achievements(new.referrer_id);
  perform check_achievements(new.referred_id);
  return new;
end;
$$;
drop trigger if exists trg_check_ach_ref on referrals;
create trigger trg_check_ach_ref
  after insert on referrals
  for each row execute function tg_check_achievements_ref();

-- Lock from direct user invocation
revoke execute on function check_achievements(uuid) from public, anon, authenticated;
revoke execute on function add_ach(uuid, text) from public, anon, authenticated;
