-- Promote the project owner to admin by email (no UUID hardcoded).
-- Idempotent: if email not found, no-op.
update profiles set is_admin = true
 where id = (select id from auth.users where email = 'cgraells@gmail.com' limit 1)
   and is_admin = false;

update profiles set is_admin = true
 where id = (select id from auth.users where email = 'cgraells@hotmail.com' limit 1)
   and is_admin = false;
