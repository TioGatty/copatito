-- ─── Helper: bypass RLS to check membership ────────────────
create or replace function is_pool_member(p_pool uuid, p_user uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from pool_members
     where pool_id = p_pool and user_id = p_user
  );
$$;

create or replace function are_pool_comembers(p_a uuid, p_b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
      from pool_members a
      join pool_members b on b.pool_id = a.pool_id
     where a.user_id = p_a and b.user_id = p_b
  );
$$;

-- ─── Rewrite policies to use the helpers (no recursion) ─────
drop policy if exists "pool_members read self pool" on pool_members;
create policy "pool_members read self pool" on pool_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or is_pool_member(pool_members.pool_id, auth.uid())
  );

drop policy if exists "pool read members" on pools;
create policy "pool read members" on pools
  for select to authenticated
  using (
    creator_id = auth.uid()
    or is_pool_member(pools.id, auth.uid())
  );

drop policy if exists "pool comembers profile read" on profiles;
create policy "pool comembers profile read" on profiles
  for select to authenticated
  using (
    are_pool_comembers(auth.uid(), profiles.id)
  );

-- ─── Same for predictions visibility policy ─────────────────
drop policy if exists "shared pool predictions read" on predictions;
create policy "shared pool predictions read" on predictions
  for select to authenticated
  using (
    user_id <> auth.uid()
    and are_pool_comembers(auth.uid(), predictions.user_id)
    and exists (
      select 1 from matches m
       where m.id = predictions.match_id
         and m.kickoff_at <= now()
    )
  );
