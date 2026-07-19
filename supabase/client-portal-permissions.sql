-- MKETICS Step 67: Client portal access policies
-- Purpose: allow client users to read their own linked records and create support requests.

-- 1. Helper: true for admin/staff users
create or replace function public.is_mketics_admin_or_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('admin', 'staff')
  );
$$;

-- 2. Helper: true when the authenticated user owns or matches a client record
create or replace function public.can_access_client_record(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    where c.id = target_client_id
      and (
        c.profile_id = auth.uid()
        or lower(coalesce(c.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or public.is_mketics_admin_or_staff()
      )
  );
$$;

-- 3. Allow clients to read their own profile. Existing own-profile policy may already exist.
drop policy if exists "Clients can read own profile" on public.profiles;
create policy "Clients can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- 4. Allow clients to read their own linked client records.
drop policy if exists "Clients can read own client records" on public.clients;
create policy "Clients can read own client records"
on public.clients
for select
to authenticated
using (
  profile_id = auth.uid()
  or lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- 5. Allow clients to read projects linked to their client record.
drop policy if exists "Clients can read own projects" on public.projects;
create policy "Clients can read own projects"
on public.projects
for select
to authenticated
using (public.can_access_client_record(client_id));

-- 6. Allow clients to read quotes linked to their client record.
drop policy if exists "Clients can read own quotes" on public.quotes;
create policy "Clients can read own quotes"
on public.quotes
for select
to authenticated
using (public.can_access_client_record(client_id));

-- 7. Allow clients to read support tickets linked to their client record.
drop policy if exists "Clients can read own support tickets" on public.support_tickets;
create policy "Clients can read own support tickets"
on public.support_tickets
for select
to authenticated
using (public.can_access_client_record(client_id));

-- 8. Allow clients to create support tickets for their linked client record.
drop policy if exists "Clients can create own support tickets" on public.support_tickets;
create policy "Clients can create own support tickets"
on public.support_tickets
for insert
to authenticated
with check (public.can_access_client_record(client_id));

-- 9. Allow clients to read documents linked to their client record.
drop policy if exists "Clients can read own documents" on public.documents;
create policy "Clients can read own documents"
on public.documents
for select
to authenticated
using (public.can_access_client_record(client_id));

-- 10. Allow clients to create signed URLs for documents stored in the private bucket.
drop policy if exists "Clients can read own storage documents" on storage.objects;
create policy "Clients can read own storage documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mketics-documents'
  and exists (
    select 1
    from public.documents d
    where d.storage_path = storage.objects.name
      and public.can_access_client_record(d.client_id)
  )
);

-- 11. Table grants required by PostgREST before RLS policies are evaluated.
grant select on table public.profiles to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
grant select on table public.documents to authenticated;
grant select, insert on table public.support_tickets to authenticated;

grant usage on schema storage to authenticated;
grant select on table storage.objects to authenticated;

-- 12. Optional: link a client auth user to an existing client record after creating the Auth user.
-- Replace the placeholders and run manually when adding a real client.
-- update public.clients
-- set profile_id = '<AUTH_USER_UUID>'
-- where lower(email) = lower('client@example.com');
