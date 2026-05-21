-- Track first-time tutorial completion
alter table profiles
  add column if not exists onboarded boolean not null default false;

-- Allow user to update their own onboarded flag (column-level grant)
grant update (onboarded) on profiles to authenticated;
