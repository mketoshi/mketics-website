-- MKETICS Supabase Live Data Readiness SQL
-- Review before running in Supabase SQL Editor.
-- This script uses safe CREATE TABLE IF NOT EXISTS patterns.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  service text,
  size text,
  message text,
  estimated_price numeric default 0,
  status text default 'New',
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  client_email text,
  project_name text,
  service text,
  description text,
  status text default 'Planning',
  board_column text default 'Planning',
  priority text default 'Medium',
  assigned_to text,
  progress integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  client_email text,
  invoice_number text,
  service text,
  notes text,
  amount numeric default 0,
  status text default 'Unpaid',
  due_date date,
  payment_url text,
  paid_at timestamptz,
  payment_reference text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  company_name text,
  workspace_id uuid,
  role text default 'client',
  created_at timestamptz default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  client_email text,
  subject text,
  message text,
  status text default 'Open',
  created_at timestamptz default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  workspace_id uuid,
  client_email text,
  update_title text,
  update_message text,
  created_at timestamptz default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  workspace_id uuid,
  client_email text,
  file_name text,
  file_url text,
  file_type text,
  category text,
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists public.support_files (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid,
  workspace_id uuid,
  client_email text,
  file_name text,
  file_url text,
  file_type text,
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text,
  type text default 'info',
  created_at timestamptz default now()
);

-- Enforce invoice status values.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_status_paid_unpaid_check'
  ) then
    alter table public.invoices
    add constraint invoices_status_paid_unpaid_check
    check (status in ('Paid', 'Unpaid'));
  end if;
end $$;

-- Recommended indexes
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_projects_client_email on public.projects(client_email);
create index if not exists idx_invoices_client_email on public.invoices(client_email);
create index if not exists idx_tickets_client_email on public.support_tickets(client_email);
create index if not exists idx_project_files_client_email on public.project_files(client_email);
create index if not exists idx_support_files_client_email on public.support_files(client_email);

-- Storage bucket must be created in Supabase Storage UI:
-- Bucket name: mketics-files
