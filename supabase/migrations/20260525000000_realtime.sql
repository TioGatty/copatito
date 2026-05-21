-- ─── Enable realtime publication for live updates ────────────
-- Supabase Realtime listens to logical replication on this publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table matches;
  end if;
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and tablename = 'predictions'
  ) then
    alter publication supabase_realtime add table predictions;
  end if;
end$$;
