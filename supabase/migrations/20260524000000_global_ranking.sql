-- ─── Global ranking RPC (bypasses RLS via security definer) ──
create or replace function get_global_ranking(p_limit int default 100)
returns table (
  user_id uuid,
  display_name text,
  points int,
  predictions int,
  hits int,
  rank int
) language sql security definer stable as $$
  with agg as (
    select p.id as user_id,
           coalesce(p.display_name, 'Jugador') as display_name,
           coalesce(sum(pr.points), 0)::int as points,
           count(pr.id)::int as predictions,
           count(pr.id) filter (where pr.points > 0)::int as hits
      from profiles p
      left join predictions pr on pr.user_id = p.id
     group by p.id, p.display_name
  )
  select user_id, display_name, points, predictions, hits,
         (rank() over (order by points desc, hits desc, predictions desc))::int as rank
    from agg
   order by points desc, hits desc, predictions desc
   limit greatest(1, least(p_limit, 500));
$$;

create or replace function get_my_global_rank()
returns table (rank int, points int, hits int, total_users int)
language sql security definer stable as $$
  with agg as (
    select p.id as user_id,
           coalesce(sum(pr.points), 0)::int as points,
           count(pr.id) filter (where pr.points > 0)::int as hits
      from profiles p
      left join predictions pr on pr.user_id = p.id
     group by p.id
  ),
  ranked as (
    select user_id, points, hits,
           (rank() over (order by points desc, hits desc))::int as rank
      from agg
  )
  select r.rank, r.points, r.hits, (select count(*) from agg)::int as total_users
    from ranked r where r.user_id = auth.uid();
$$;
