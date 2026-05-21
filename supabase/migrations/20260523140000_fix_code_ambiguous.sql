-- Fix ambiguous "code" reference in gen_pool_code
create or replace function gen_pool_code()
returns text language plpgsql as $$
declare
  alphabet  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code  text;
  attempt   int := 0;
begin
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (select 1 from pools p where p.code = new_code) then
      return new_code;
    end if;
    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'code_generation_failed';
    end if;
  end loop;
end;
$$;
