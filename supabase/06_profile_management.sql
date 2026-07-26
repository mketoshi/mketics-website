begin;

create or replace function public.update_client_portal_profile(
  profile_full_name text,
  profile_phone text default null,
  profile_organisation text default null
)
returns table (
  id uuid, full_name text, email text, role public.app_role, phone text,
  organisation text, created_at timestamptz, updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare v_rows integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if char_length(btrim(coalesce(profile_full_name, ''))) not between 1 and 150 then
    raise exception 'Full name must contain 1 to 150 characters.';
  end if;
  if char_length(coalesce(profile_phone, '')) > 40 then
    raise exception 'Phone exceeds 40 characters.';
  end if;
  if char_length(coalesce(profile_organisation, '')) > 200 then
    raise exception 'Organisation exceeds 200 characters.';
  end if;

  update public.profiles p
  set full_name = btrim(profile_full_name),
      phone = nullif(btrim(profile_phone), ''),
      organisation = nullif(btrim(profile_organisation), ''),
      updated_at = now()
  where p.id = auth.uid();
  get diagnostics v_rows = row_count;
  if v_rows = 0 then raise exception 'Profile not found.'; end if;

  update public.clients c
  set full_name = btrim(profile_full_name),
      phone = nullif(btrim(profile_phone), ''),
      organisation = nullif(btrim(profile_organisation), ''),
      updated_at = now()
  where c.profile_id = auth.uid();

  return query
  select p.id, p.full_name, p.email, p.role, p.phone, p.organisation,
    p.created_at, p.updated_at
  from public.profiles p where p.id = auth.uid();
end;
$$;

revoke all on function public.update_client_portal_profile(text,text,text)
  from public, anon, authenticated;
grant execute on function public.update_client_portal_profile(text,text,text)
  to authenticated;

commit;
select pg_notify('pgrst', 'reload schema');

