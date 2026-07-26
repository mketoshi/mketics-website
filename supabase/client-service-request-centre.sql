-- MKETICS Step 78: Client Service Request Centre
-- Safe to rerun after clients, profiles, quotes and projects exist.
create extension if not exists pgcrypto;

create or replace function public.is_mketics_admin_or_staff()
returns boolean language sql security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role::text in ('admin','staff')); $$;

create or replace function public.can_access_client_record(target_client_id uuid)
returns boolean language sql security definer set search_path = public
as $$ select public.is_mketics_admin_or_staff() or exists (
  select 1 from public.clients c where c.id = target_client_id
  and (c.profile_id = auth.uid() or lower(coalesce(c.email,'')) = lower(coalesce(auth.jwt()->>'email','')))
); $$;

create sequence if not exists public.service_request_number_seq start 1001;
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default ('SR-' || to_char(current_date,'YYYY') || '-' || lpad(nextval('public.service_request_number_seq')::text,5,'0')),
  client_id uuid not null references public.clients(id) on delete cascade,
  service_category text not null,
  package_name text,
  title text not null,
  requirements text not null,
  budget text,
  desired_completion_date date,
  status text not null default 'submitted' check (status in ('submitted','under_review','more_information_required','quotation_prepared','awaiting_client','approved','declined','converted','closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_name text,
  admin_notes text,
  quoted_amount numeric(12,2),
  currency text not null default 'ZAR',
  proposed_scope text,
  quote_id uuid references public.quotes(id) on delete set null,
  client_decision text check (client_decision is null or client_decision in ('pending','accepted','declined')),
  client_feedback text,
  client_responded_at timestamptz,
  project_id uuid references public.projects(id) on delete set null,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.service_request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  file_name text not null, file_size bigint, mime_type text, storage_path text not null unique,
  uploaded_by uuid default auth.uid(), created_at timestamptz not null default now()
);
create index if not exists service_requests_client_idx on public.service_requests(client_id, created_at desc);
alter table public.service_requests enable row level security;
alter table public.service_request_attachments enable row level security;
grant select, insert on public.service_requests, public.service_request_attachments to authenticated;
grant update, delete on public.service_requests, public.service_request_attachments to authenticated;

drop policy if exists "Staff manage service requests" on public.service_requests;
create policy "Staff manage service requests" on public.service_requests for all to authenticated using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read own service requests" on public.service_requests;
create policy "Clients read own service requests" on public.service_requests for select to authenticated using (public.can_access_client_record(client_id));
drop policy if exists "Clients create own service requests" on public.service_requests;
create policy "Clients create own service requests" on public.service_requests for insert to authenticated with check (public.can_access_client_record(client_id) and status = 'submitted');
drop policy if exists "Users access service request attachments" on public.service_request_attachments;
create policy "Users access service request attachments" on public.service_request_attachments for all to authenticated using (public.can_access_client_record(client_id)) with check (public.can_access_client_record(client_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('service-request-files','service-request-files',false,10485760,array['application/pdf','image/png','image/jpeg','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Service request files read" on storage.objects;
create policy "Service request files read" on storage.objects for select to authenticated using (bucket_id='service-request-files' and public.can_access_client_record((storage.foldername(name))[1]::uuid));
drop policy if exists "Service request files upload" on storage.objects;
create policy "Service request files upload" on storage.objects for insert to authenticated with check (bucket_id='service-request-files' and public.can_access_client_record((storage.foldername(name))[1]::uuid));
drop policy if exists "Service request files staff delete" on storage.objects;
create policy "Service request files staff delete" on storage.objects for delete to authenticated using (bucket_id='service-request-files' and public.is_mketics_admin_or_staff());

create or replace function public.prepare_service_request_quote(target_request_id uuid, quote_amount numeric, scope_summary text)
returns public.service_requests language plpgsql security definer set search_path=public as $$
declare r public.service_requests; q uuid;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  if quote_amount < 0 or nullif(trim(scope_summary),'') is null then raise exception 'Price and scope are required'; end if;
  select * into r from public.service_requests where id=target_request_id for update;
  if not found then raise exception 'Request not found'; end if;
  insert into public.quotes(client_id,title,scope_summary,amount,currency,status,sent_at)
  values(r.client_id,r.title,trim(scope_summary),quote_amount,'ZAR','sent',now()) returning id into q;
  update public.service_requests set quote_id=q, quoted_amount=quote_amount, proposed_scope=trim(scope_summary), status='awaiting_client', client_decision='pending', updated_at=now()
  where id=target_request_id returning * into r; return r;
end; $$;

create or replace function public.respond_to_service_request_quote(target_request_id uuid, response_decision text, response_feedback text default null)
returns public.service_requests language plpgsql security definer set search_path=public as $$
declare r public.service_requests;
begin
  if response_decision not in ('accepted','declined') then raise exception 'Invalid response'; end if;
  if not exists(select 1 from public.service_requests s where s.id=target_request_id and s.client_decision='pending' and public.can_access_client_record(s.client_id)) then raise exception 'Request unavailable'; end if;
  update public.service_requests set client_decision=response_decision, client_feedback=nullif(trim(response_feedback),''),
    client_responded_at=now(), status=case when response_decision='accepted' then 'approved' else 'declined' end, updated_at=now()
  where id=target_request_id returning * into r;
  update public.quotes set status=case when response_decision='accepted' then 'accepted'::public.quote_status else 'rejected'::public.quote_status end,
    accepted_at=case when response_decision='accepted' then now() else accepted_at end,
    rejected_at=case when response_decision='declined' then now() else rejected_at end where id=r.quote_id;
  return r;
end; $$;

create or replace function public.convert_service_request_to_project(target_request_id uuid, actor_profile_id uuid default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare r public.service_requests; new_project uuid;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  select * into r from public.service_requests where id=target_request_id for update;
  if not found or r.client_decision <> 'accepted' then raise exception 'Only accepted requests can be converted'; end if;
  if r.project_id is not null then return r.project_id; end if;
  insert into public.projects(client_id,title,description,service_type,status,start_date,due_date)
  values(r.client_id,r.title,r.proposed_scope,r.service_category,'new',current_date,r.desired_completion_date) returning id into new_project;
  update public.quotes set project_id=new_project where id=r.quote_id;
  update public.service_requests set project_id=new_project,status='converted',converted_at=now(),updated_at=now() where id=r.id;
  return new_project;
end; $$;

revoke all on function public.prepare_service_request_quote(uuid,numeric,text) from public;
revoke all on function public.respond_to_service_request_quote(uuid,text,text) from public;
revoke all on function public.convert_service_request_to_project(uuid,uuid) from public;
grant execute on function public.prepare_service_request_quote(uuid,numeric,text) to authenticated;
grant execute on function public.respond_to_service_request_quote(uuid,text,text) to authenticated;
grant execute on function public.convert_service_request_to_project(uuid,uuid) to authenticated;
