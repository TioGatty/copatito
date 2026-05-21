-- ─── Robust handle_new_user trigger ────────────────────────
-- Wraps in BEGIN/EXCEPTION to surface actual error and avoid blocking signup.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_name text;
begin
  v_name := coalesce(nullif(split_part(coalesce(new.email,''), '@', 1), ''), 'Jugador');

  begin
    insert into profiles (id, display_name, coins, avatar_preset, locale, theme_pref)
      values (new.id, v_name, 100, 0, 'es', 'dark')
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user profile insert failed: %', sqlerrm;
  end;

  begin
    if not exists (
      select 1 from coin_transactions
       where user_id = new.id and reason = 'initial_grant'
    ) then
      insert into coin_transactions (user_id, amount, reason)
        values (new.id, 100, 'initial_grant');
    end if;
  exception when others then
    raise warning 'handle_new_user coin_transactions insert failed: %', sqlerrm;
  end;

  return new;
end;
$$;
