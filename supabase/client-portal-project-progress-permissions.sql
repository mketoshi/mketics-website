-- MKETICS Step 69: Client portal project progress updates and approvals
-- Progress and approval records are stored in public.settings rows:
-- setting_key = 'client_portal_project_progress_updates_v1'
-- setting_key = 'client_portal_project_approvals_v1'

-- Keep this table available to authenticated portal users.
grant select, insert, update on table public.settings to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.clients to authenticated;

-- Helper: signed-in client profile check.
create or replace function public.is_client_portal_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('client', 'admin', 'staff')
  );
$$;

-- Allow authenticated portal users to read only project portal setting rows.
drop policy if exists "Client portal can read project progress settings" on public.settings;
create policy "Client portal can read project progress settings"
on public.settings
for select
to authenticated
using (
  setting_key in (
    'client_portal_project_progress_updates_v1',
    'client_portal_project_approvals_v1'
  )
  and public.is_client_portal_user()
);

-- Allow authenticated portal users to create the approvals settings row when it does not exist.
drop policy if exists "Client portal can create project approval settings" on public.settings;
create policy "Client portal can create project approval settings"
on public.settings
for insert
to authenticated
with check (
  setting_key = 'client_portal_project_approvals_v1'
  and public.is_client_portal_user()
);

-- Allow authenticated portal users to append/update approval responses.
drop policy if exists "Client portal can update project approval settings" on public.settings;
create policy "Client portal can update project approval settings"
on public.settings
for update
to authenticated
using (
  setting_key = 'client_portal_project_approvals_v1'
  and public.is_client_portal_user()
)
with check (
  setting_key = 'client_portal_project_approvals_v1'
  and public.is_client_portal_user()
);
