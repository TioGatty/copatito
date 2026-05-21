-- ─── Backfill: ensure every auth.user has profile + 100 coin initial grant ────
do $$
declare
  r record;
begin
  for r in select id, email from auth.users loop
    -- Insert profile if missing
    insert into profiles (id, display_name, coins, avatar_preset, locale, theme_pref)
      values (
        r.id,
        coalesce(nullif(split_part(coalesce(r.email, ''), '@', 1), ''), 'Jugador'),
        100, 0, 'es', 'dark'
      )
    on conflict (id) do nothing;

    -- Insert initial_grant tx + add coins if not already granted
    if not exists (
      select 1 from coin_transactions
       where user_id = r.id and reason = 'initial_grant'
    ) then
      insert into coin_transactions (user_id, amount, reason)
        values (r.id, 100, 'initial_grant');
      update profiles set coins = coins + 100 where id = r.id and coins < 100;
    end if;
  end loop;
end$$;

-- ─── Tighten trigger: avoid exception-swallow but still robust ────
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Jugador');

  insert into profiles (id, display_name, coins, avatar_preset, locale, theme_pref)
    values (new.id, v_name, 100, 0, 'es', 'dark')
  on conflict (id) do update
    set display_name = excluded.display_name
    where profiles.display_name is null;

  insert into coin_transactions (user_id, amount, reason)
    select new.id, 100, 'initial_grant'
     where not exists (
       select 1 from coin_transactions
        where user_id = new.id and reason = 'initial_grant'
     );

  return new;
end;
$$;
