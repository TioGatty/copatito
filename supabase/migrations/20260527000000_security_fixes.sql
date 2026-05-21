-- ─── CN-001 — Restrict profile UPDATE to non-economic columns ────
-- Revoke broad UPDATE on profiles from authenticated role.
-- Re-grant only the columns users may legitimately change.
revoke update on profiles from authenticated;
grant update (display_name, avatar_preset, locale, theme_pref)
  on profiles to authenticated;

-- Tighten RLS policy: with check now just enforces own-row.
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── CN-016 — Lock award_coins from direct user invocation ───────
-- award_coins is meant to be called only by other SECURITY DEFINER
-- functions (create_pool, join_pool, claim_daily_bonus, trigger).
revoke execute on function award_coins(uuid, int, text, uuid) from public, anon, authenticated;
-- service_role + function owner still have access by default

-- ─── CN-016 — Lock recalc_match_predictions ───────────────────────
revoke execute on function recalc_match_predictions(uuid) from public, anon, authenticated;

-- ─── CN-016 — Lock calc_prediction_points ─────────────────────────
revoke execute on function calc_prediction_points(uuid) from public, anon, authenticated;

-- ─── CN-003 — Helper: reverse coin awards for a finalised match ──
-- Called by admin server action when reverting a match.
-- Looks up each prediction's awarded amount and debits it.
create or replace function reverse_match_coin_awards(p_match_id uuid)
returns int language plpgsql security definer as $$
declare
  total_reversed int := 0;
  r record;
  exact_score boolean;
  m matches%rowtype;
begin
  select * into m from matches where id = p_match_id;
  if not found or m.home_score is null or m.away_score is null then
    return 0;
  end if;

  for r in
    select id, user_id, home_score, away_score, points
      from predictions
     where match_id = p_match_id
       and points is not null
       and points > 0
  loop
    exact_score := (r.home_score = m.home_score and r.away_score = m.away_score);
    -- prediction_hit gave +1, prediction_exact gave +5 extra (only on hits)
    update profiles set coins = greatest(0, coins - (case when exact_score then 6 else 1 end))
      where id = r.user_id;
    insert into coin_transactions (user_id, amount, reason, ref_id)
      values (r.user_id, -(case when exact_score then 6 else 1 end), 'admin_adjust', r.id);
    total_reversed := total_reversed + 1;
  end loop;

  return total_reversed;
end;
$$;

-- Only service_role can call this (admin actions only)
revoke execute on function reverse_match_coin_awards(uuid) from public, anon, authenticated;
