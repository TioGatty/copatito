-- ═══ PUBLIC PROFILE RPC ══════════════════════════════════════
-- Anyone (auth or anon) can resolve a referral code into a public profile + stats.
-- Returns only safe public fields (no email, no coins, no internal IDs visible).
create or replace function get_public_profile(p_code text)
returns table (
  user_id        uuid,
  display_name   text,
  avatar_preset  smallint,
  points         int,
  predictions    int,
  hits           int,
  exacts         int,
  achievements   int,
  global_rank    int,
  referral_code  text
) language plpgsql security definer stable as $$
declare
  v_user uuid;
begin
  select id into v_user from profiles
   where referral_code = upper(trim(p_code))
   limit 1;
  if v_user is null then return; end if;

  return query
  with agg as (
    select coalesce(sum(pr.points), 0)::int as pts,
           count(pr.id)::int as preds,
           count(pr.id) filter (where pr.points > 0)::int as hh,
           count(pr.id) filter (where pr.points is not null and exists (
             select 1 from matches m
              where m.id = pr.match_id and m.status='finished'
                and m.home_score = pr.home_score and m.away_score = pr.away_score
           ))::int as ex
      from predictions pr where pr.user_id = v_user
  ),
  ranked as (
    select profiles.id,
           rank() over (
             order by coalesce((select sum(points) from predictions where user_id = profiles.id), 0) desc
           )::int as r
      from profiles
  )
  select v_user,
         (select coalesce(p.display_name, 'Jugador') from profiles p where p.id = v_user),
         (select p.avatar_preset from profiles p where p.id = v_user),
         agg.pts, agg.preds, agg.hh, agg.ex,
         (select count(*)::int from user_achievements where user_id = v_user),
         (select r from ranked where id = v_user),
         (select referral_code from profiles where id = v_user)
    from agg;
end;
$$;

grant execute on function get_public_profile(text) to anon, authenticated;
