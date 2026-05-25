-- ═══ ADMIN STATS RPC ═════════════════════════════════════════
-- Returns aggregated metrics. Caller must be admin (check inside).
create or replace function get_admin_stats()
returns jsonb language plpgsql security definer as $$
declare
  v jsonb;
  is_admin_caller boolean;
begin
  -- Auth gate
  select coalesce(p.is_admin, false) into is_admin_caller
   from profiles p where p.id = auth.uid();
  if not is_admin_caller then
    raise exception 'forbidden';
  end if;

  with stats as (
    select
      (select count(*) from auth.users)                                     as total_users,
      (select count(*) from auth.users where last_sign_in_at > now() - interval '24 hours') as dau,
      (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days')   as wau,
      (select count(*) from auth.users where created_at > now() - interval '24 hours')      as signups_24h,
      (select count(*) from predictions)                                    as total_predictions,
      (select count(*) from predictions where points > 0)                   as total_hits,
      (select count(*) from predictions
        where points is not null and exists (
          select 1 from matches m
           where m.id = predictions.match_id
             and m.status='finished'
             and m.home_score = predictions.home_score
             and m.away_score = predictions.away_score
        ))                                                                  as total_exacts,
      (select coalesce(sum(points), 0)::int from predictions
        where points is not null)                                           as total_points_awarded,
      (select count(*) from pools)                                          as total_pools,
      (select count(*) from pool_members)                                   as total_pool_memberships,
      (select coalesce(sum(coins), 0)::int from profiles)                   as coins_in_circulation,
      (select count(*) from referrals)                                      as total_referrals,
      (select count(*) from matches where status='finished')                as matches_finished,
      (select count(*) from matches where status='live')                    as matches_live,
      (select count(*) from matches where status='scheduled')               as matches_scheduled,
      (select count(*) from user_achievements)                              as total_achievements_unlocked
  )
  select to_jsonb(stats.*) into v from stats;
  return v;
end;
$$;

revoke execute on function get_admin_stats() from public, anon;
grant execute on function get_admin_stats() to authenticated;

-- Top users by points (limited to admin context)
create or replace function get_admin_top_users(p_limit int default 20)
returns table (
  user_id uuid,
  display_name text,
  avatar_preset smallint,
  email text,
  points int,
  predictions int,
  hits int,
  pools_owned int,
  joined_at timestamptz
) language plpgsql security definer as $$
declare
  is_admin_caller boolean;
begin
  select coalesce(p.is_admin, false) into is_admin_caller
   from profiles p where p.id = auth.uid();
  if not is_admin_caller then raise exception 'forbidden'; end if;

  return query
  select
    p.id,
    coalesce(p.display_name, 'Jugador'),
    p.avatar_preset,
    u.email,
    coalesce(sum(pr.points), 0)::int,
    count(pr.id)::int,
    count(pr.id) filter (where pr.points > 0)::int,
    (select count(*)::int from pools where creator_id = p.id),
    u.created_at
  from profiles p
  join auth.users u on u.id = p.id
  left join predictions pr on pr.user_id = p.id
  group by p.id, p.display_name, p.avatar_preset, u.email, u.created_at
  order by 5 desc, 7 desc
  limit greatest(1, least(p_limit, 100));
end;
$$;

revoke execute on function get_admin_top_users(int) from public, anon;
grant execute on function get_admin_top_users(int) to authenticated;
