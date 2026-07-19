-- MKETICS Step 71: Admin-side client portal response inbox permissions
-- Allows authenticated admin/staff users to read and update portal response records stored in public.settings.

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

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.settings to authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "MKETICS admins manage portal response settings" on public.settings;

create policy "MKETICS admins manage portal response settings"
on public.settings
for all
to authenticated
using (
  public.is_mketics_admin_or_staff()
  or setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1',
    'client_portal_project_approvals_v1',
    'client_portal_project_progress_updates_v1'
  )
)
with check (
  public.is_mketics_admin_or_staff()
  or setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1',
    'client_portal_project_approvals_v1',
    'client_portal_project_progress_updates_v1'
  )
);

select pg_notify('pgrst', 'reload schema');
