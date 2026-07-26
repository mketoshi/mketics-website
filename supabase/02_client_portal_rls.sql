begin;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.support_tickets enable row level security;
alter table public.documents enable row level security;
alter table public.settings enable row level security;

-- Profile writes are routed through the controlled profile RPC.
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Clients can read own profile" on public.profiles;
drop policy if exists "Client portal can read own profile" on public.profiles;
create policy "Client portal can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Clients can read own client records" on public.clients;
drop policy if exists "Client portal can read own client record" on public.clients;
create policy "Client portal can read own client record"
on public.clients for select to authenticated
using (profile_id = auth.uid());

drop policy if exists "Clients can read own projects" on public.projects;
drop policy if exists "Client portal can read own projects" on public.projects;
create policy "Client portal can read own projects"
on public.projects for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = projects.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can read own quotes" on public.quotes;
drop policy if exists "Client portal can read own quote records" on public.quotes;
drop policy if exists "Client portal can read own quotes" on public.quotes;
drop policy if exists "Client portal can update own quote status" on public.quotes;
create policy "Client portal can read own quotes"
on public.quotes for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = quotes.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Client portal can read own support tickets"
  on public.support_tickets;
drop policy if exists "Clients can read own support tickets"
  on public.support_tickets;
create policy "Client portal can read own support tickets"
on public.support_tickets for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = support_tickets.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can create own support tickets"
  on public.support_tickets;
create policy "Clients can create own support tickets"
on public.support_tickets for insert to authenticated
with check (
  client_id is not null
  and exists (
    select 1 from public.clients c
    where c.id = support_tickets.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can read own documents" on public.documents;
drop policy if exists "Client portal can read own documents" on public.documents;
create policy "Client portal can read own documents"
on public.documents for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = documents.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Client portal users can read announcements"
  on public.settings;
drop policy if exists "Client portal can read project progress settings"
  on public.settings;
drop policy if exists "Client portal can create project approval settings"
  on public.settings;
drop policy if exists "Client portal can update project approval settings"
  on public.settings;
drop policy if exists "Client portal can read quote and payment request settings"
  on public.settings;
drop policy if exists "Client portal can create quote and payment request settings"
  on public.settings;
drop policy if exists "Client portal can update quote and payment request settings"
  on public.settings;
create policy "Client portal users can read announcements"
on public.settings for select to authenticated
using (
  setting_key = 'client_portal_announcements_v1'
  and exists (
    select 1 from public.clients c where c.profile_id = auth.uid()
  )
);

insert into public.settings(setting_key, setting_value, description)
values (
  'client_portal_announcements_v1',
  jsonb_build_object('announcements', '[]'::jsonb),
  'MKETICS client portal announcements and notifications.'
)
on conflict (setting_key) do nothing;

commit;
