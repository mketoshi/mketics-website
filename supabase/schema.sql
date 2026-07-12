create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('admin', 'staff', 'client');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lead_status as enum (
    'new',
    'reviewed',
    'contacted',
    'quoted',
    'won',
    'lost',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_status as enum (
    'new',
    'planning',
    'in_design',
    'in_development',
    'review',
    'awaiting_client',
    'completed',
    'support'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.quote_status as enum (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ticket_status as enum (
    'open',
    'in_progress',
    'waiting_for_client',
    'resolved',
    'closed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ticket_priority as enum (
    'low',
    'normal',
    'high',
    'urgent'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.app_role not null default 'client',
  phone text,
  organisation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  full_name text not null,
  email text,
  phone text,
  organisation text,

  service_needed text not null,
  budget text,
  timeline text,
  preferred_contact text,
  project_details text not null,

  lead_source text not null default 'website_contact_form',
  status public.lead_status not null default 'new',

  recommended_service text,
  service_pillar text,
  readiness_level text,
  supporting_services text,
  selected_answers text,

  ga_client_id text,
  page_url text,
  metadata jsonb not null default '{}'::jsonb,

  internal_notes text
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  organisation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,

  title text not null,
  description text,
  service_type text,
  status public.project_status not null default 'new',

  start_date date,
  due_date date,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,

  quote_number text,
  title text not null,
  scope_summary text,
  exclusions text,
  amount numeric(12,2),
  currency text not null default 'ZAR',
  status public.quote_status not null default 'draft',

  valid_until date,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,

  ticket_type text,
  priority public.ticket_priority not null default 'normal',
  subject text not null,
  description text not null,
  status public.ticket_status not null default 'open',

  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  closed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,

  title text not null,
  document_type text,
  storage_path text,
  public_url text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),

  related_table text,
  related_id uuid,
  task_type text not null,

  prompt_summary text,
  input_snapshot jsonb not null default '{}'::jsonb,
  output_snapshot jsonb not null default '{}'::jsonb,

  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role in ('admin', 'staff')
  );
$$;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.support_tickets enable row level security;
alter table public.documents enable row level security;
alter table public.ai_logs enable row level security;
alter table public.settings enable row level security;

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

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can manage leads" on public.leads;
create policy "Admins can manage leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage lead notes" on public.lead_notes;
create policy "Admins can manage lead notes"
on public.lead_notes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage clients" on public.clients;
create policy "Admins can manage clients"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage quotes" on public.quotes;
create policy "Admins can manage quotes"
on public.quotes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage tickets" on public.support_tickets;
create policy "Admins can manage tickets"
on public.support_tickets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage documents" on public.documents;
create policy "Admins can manage documents"
on public.documents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage ai logs" on public.ai_logs;
create policy "Admins can manage ai logs"
on public.ai_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can manage settings"
on public.settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_service_needed_idx on public.leads(service_needed);
create index if not exists lead_notes_lead_id_idx on public.lead_notes(lead_id);
create index if not exists clients_email_idx on public.clients(email);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists support_tickets_status_idx on public.support_tickets(status);
create index if not exists support_tickets_priority_idx on public.support_tickets(priority);
create index if not exists ai_logs_related_idx on public.ai_logs(related_table, related_id);