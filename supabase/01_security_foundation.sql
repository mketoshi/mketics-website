begin;

create unique index if not exists clients_profile_id_unique_idx
  on public.clients(profile_id)
  where profile_id is not null;

create index if not exists clients_profile_id_idx on public.clients(profile_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists quotes_client_id_idx on public.quotes(client_id);
create index if not exists support_tickets_client_id_idx
  on public.support_tickets(client_id);
create index if not exists documents_client_id_idx on public.documents(client_id);

create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin'::public.app_role, 'staff'::public.app_role)
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin_or_staff();
$$;

revoke all on function public.is_admin_or_staff() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin_or_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

grant usage on schema public to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, insert, update, delete on
  public.profiles, public.leads, public.lead_notes, public.clients,
  public.projects, public.quotes, public.support_tickets, public.documents,
  public.ai_logs, public.settings
to authenticated;

-- RLS, rather than a missing table grant, distinguishes staff from clients.
-- Portal-client writes to shared settings are intentionally not permitted by
-- any policy; controlled RPCs perform client actions.
revoke all on public.settings from anon;

commit;
