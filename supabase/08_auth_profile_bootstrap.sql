begin;

create or replace function public.handle_new_portal_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(
    id, full_name, email, role, phone, organisation
  ) values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'MKETICS Client'
    ),
    lower(new.email),
    'client'::public.app_role,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'organisation', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(public.profiles.full_name, ''),
        excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      organisation = coalesce(public.profiles.organisation,
        excluded.organisation),
      updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_portal_user()
  from public, anon, authenticated;

drop trigger if exists create_portal_profile_after_signup on auth.users;
create trigger create_portal_profile_after_signup
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_portal_user();

-- Repair missing profiles without changing an existing admin/staff role.
insert into public.profiles(id, full_name, email, role, phone, organisation)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(u.email, '@', 1), ''),
    'MKETICS Client'
  ),
  lower(u.email),
  'client'::public.app_role,
  nullif(u.raw_user_meta_data ->> 'phone', ''),
  nullif(u.raw_user_meta_data ->> 'organisation', '')
from auth.users u
where u.email is not null
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''),
      excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    organisation = coalesce(public.profiles.organisation,
      excluded.organisation),
    updated_at = now();

commit;
select pg_notify('pgrst', 'reload schema');

