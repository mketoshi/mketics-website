-- MKETICS Step 66: Admin user management and staff access control
-- Purpose: allow only role='admin' profiles to manage other profile records.
-- Staff users can still sign in to permitted dashboard areas, but cannot manage roles.

create or replace function public.is_profile_admin_only()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

-- Keep users able to read and update their own profile.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Replace the broader profile-management policy with admin-only role control.
drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_profile_admin_only())
with check (public.is_profile_admin_only());

-- Confirm profile policies.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
order by policyname;
