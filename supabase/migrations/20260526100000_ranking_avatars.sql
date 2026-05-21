-- Add avatar_preset to ranking RPCs
drop function if exists get_global_ranking(int);
create or replace function get_global_ranking(p_limit int default 100)
returns table (
  user_id uuid,
  display_name text,
  avatar_preset smallint,
  points int,
  predictions int,
  hits int,
  rank int
) language sql security definer stable as $$
  with agg as (
    select p.id as user_id,
           coalesce(p.display_name, 'Jugador') as display_name,
           p.avatar_preset,
           coalesce(sum(pr.points), 0)::int as points,
           count(pr.id)::int as predictions,
           count(pr.id) filter (where pr.points > 0)::int as hits
      from profiles p
      left join predictions pr on pr.user_id = p.id
     group by p.id, p.display_name, p.avatar_preset
  )
  select user_id, display_name, avatar_preset, points, predictions, hits,
         (rank() over (order by points desc, hits desc, predictions desc))::int as rank
    from agg
   order by points desc, hits desc, predictions desc
   limit greatest(1, least(p_limit, 500));
$$;
