-- ─── Add per-pool cost ────────────────────────────────────────
alter table pools
  add column if not exists cost int not null default 10
    check (cost between 0 and 1000);

-- ─── Rewrite create_pool with cost parameter ─────────────────
drop function if exists create_pool(text);
create or replace function create_pool(p_name text, p_cost int default 10)
returns table (id uuid, name text, code text, cost int)
language plpgsql security definer as $$
declare
  uid       uuid := auth.uid();
  p         profiles%rowtype;
  owned     int;
  new_id    uuid;
  new_code  text;
begin
  if uid is null then raise exception 'no_auth'; end if;
  if char_length(trim(p_name)) < 3 then raise exception 'name_too_short'; end if;
  if char_length(trim(p_name)) > 40 then raise exception 'name_too_long'; end if;
  if p_cost is null or p_cost < 0 or p_cost > 1000 then raise exception 'invalid_cost'; end if;

  select * into p from profiles where profiles.id = uid for update;
  if p.coins < p_cost then raise exception 'insufficient_coins'; end if;

  select count(*) into owned from pools where creator_id = uid;
  if owned >= 5 then raise exception 'pool_limit_reached'; end if;

  new_code := gen_pool_code();
  insert into pools (name, code, creator_id, cost)
    values (trim(p_name), new_code, uid, p_cost)
    returning pools.id into new_id;
  insert into pool_members (pool_id, user_id) values (new_id, uid);

  if p_cost > 0 then
    update profiles set coins = coins - p_cost where profiles.id = uid;
    insert into coin_transactions (user_id, amount, reason, ref_id)
      values (uid, -p_cost, 'create_pool', new_id);
  end if;

  return query select new_id, trim(p_name), new_code, p_cost;
end;
$$;

-- ─── Rewrite join_pool: charge pool.cost ─────────────────────
drop function if exists join_pool(text);
create or replace function join_pool(p_code text)
returns table (id uuid, name text, cost int)
language plpgsql security definer as $$
declare
  uid   uuid := auth.uid();
  pl    pools%rowtype;
  p     profiles%rowtype;
begin
  if uid is null then raise exception 'no_auth'; end if;
  select * into pl from pools where pools.code = upper(trim(p_code));
  if not found then raise exception 'pool_not_found'; end if;
  if exists (select 1 from pool_members where pool_id = pl.id and user_id = uid) then
    raise exception 'already_member';
  end if;

  if pl.cost > 0 then
    select * into p from profiles where profiles.id = uid for update;
    if p.coins < pl.cost then raise exception 'insufficient_coins'; end if;
    update profiles set coins = coins - pl.cost where profiles.id = uid;
    insert into coin_transactions (user_id, amount, reason, ref_id)
      values (uid, -pl.cost, 'create_pool', pl.id);
  end if;

  insert into pool_members (pool_id, user_id) values (pl.id, uid);
  return query select pl.id, pl.name, pl.cost;
end;
$$;

-- ─── Drop daily bonus RPC (no longer used) ───────────────────
drop function if exists claim_daily_bonus();
