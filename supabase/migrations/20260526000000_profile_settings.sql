-- ─── Profile settings: avatar preset + locale + theme ───────
alter table profiles
  add column if not exists avatar_preset smallint not null default 0
    check (avatar_preset between 0 and 11),
  add column if not exists locale text not null default 'es'
    check (locale in ('es','en')),
  add column if not exists theme_pref text not null default 'dark'
    check (theme_pref in ('dark','light'));

-- Update handle_new_user to keep defaults
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, coins, avatar_preset, locale, theme_pref)
    values (new.id, split_part(new.email, '@', 1), 100, 0, 'es', 'dark')
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
