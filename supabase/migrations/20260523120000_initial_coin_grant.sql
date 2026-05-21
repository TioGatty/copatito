-- ─── Grant initial 100 coins to users who never received one ────
-- Idempotent: only grants to profiles that have no 'initial_grant' tx yet.
do $$
declare
  r record;
begin
  for r in
    select p.id
      from profiles p
     where not exists (
       select 1 from coin_transactions t
        where t.user_id = p.id and t.reason = 'initial_grant'
     )
  loop
    update profiles set coins = greatest(coins, 100) where id = r.id;
    insert into coin_transactions (user_id, amount, reason)
      values (r.id, 100, 'initial_grant');
  end loop;
end$$;

-- ─── Update handle_new_user to also seed initial_grant tx ───────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, coins)
    values (new.id, split_part(new.email, '@', 1), 100)
  on conflict (id) do nothing;

  if not exists (
    select 1 from coin_transactions
     where user_id = new.id and reason = 'initial_grant'
  ) then
    insert into coin_transactions (user_id, amount, reason)
      values (new.id, 100, 'initial_grant');
  end if;
  return new;
end;
$$;
