-- MKETICS Step 79: Client Contracts and Digital Approval Centre
-- Self-contained and safe to rerun after clients and profiles exist.
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

create sequence if not exists public.agreement_number_seq start 1001;
create table if not exists public.client_agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_number text not null unique default ('AGR-' || to_char(current_date,'YYYY') || '-' || lpad(nextval('public.agreement_number_seq')::text,5,'0')),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  agreement_type text not null default 'Contract',
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined','expired','cancelled')),
  current_version integer not null default 1 check (current_version > 0),
  expires_at timestamptz,
  sent_at timestamptz,
  first_viewed_at timestamptz,
  decided_at timestamptz,
  signer_name text,
  signer_position text,
  decision_comments text,
  decision_ip inet,
  decision_user_agent text,
  reminder_count integer not null default 0,
  last_reminded_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_versions (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.client_agreements(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  file_name text not null,
  file_size bigint,
  mime_type text,
  storage_path text not null unique,
  change_summary text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (agreement_id, version_number)
);

create table if not exists public.agreement_audit_log (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.client_agreements(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  version_number integer,
  event_type text not null check (event_type in ('created','version_added','sent','viewed','accepted','declined','reminder','expired','cancelled')),
  actor_id uuid,
  actor_email text,
  signer_name text,
  signer_position text,
  comments text,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists client_agreements_client_idx on public.client_agreements(client_id, created_at desc);
create index if not exists agreement_versions_agreement_idx on public.agreement_versions(agreement_id, version_number desc);
create index if not exists agreement_audit_agreement_idx on public.agreement_audit_log(agreement_id, created_at desc);

alter table public.client_agreements enable row level security;
alter table public.agreement_versions enable row level security;
alter table public.agreement_audit_log enable row level security;

grant select on public.client_agreements, public.agreement_versions, public.agreement_audit_log to authenticated;
grant insert, update, delete on public.client_agreements, public.agreement_versions to authenticated;

drop policy if exists "Staff manage agreements" on public.client_agreements;
create policy "Staff manage agreements" on public.client_agreements for all to authenticated using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read issued agreements" on public.client_agreements;
create policy "Clients read issued agreements" on public.client_agreements for select to authenticated using (status <> 'draft' and public.can_access_client_record(client_id));
drop policy if exists "Staff manage agreement versions" on public.agreement_versions;
create policy "Staff manage agreement versions" on public.agreement_versions for all to authenticated using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read issued agreement versions" on public.agreement_versions;
create policy "Clients read issued agreement versions" on public.agreement_versions for select to authenticated using (
  public.can_access_client_record(client_id) and exists (
    select 1 from public.client_agreements a where a.id=agreement_id and a.status <> 'draft'
  )
);
drop policy if exists "Staff read agreement audit" on public.agreement_audit_log;
create policy "Staff read agreement audit" on public.agreement_audit_log for select to authenticated using (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read own agreement audit" on public.agreement_audit_log;
create policy "Clients read own agreement audit" on public.agreement_audit_log for select to authenticated using (public.can_access_client_record(client_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('client-agreements','client-agreements',false,15728640,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Agreement files read" on storage.objects;
create policy "Agreement files read" on storage.objects for select to authenticated using (
  bucket_id='client-agreements' and public.can_access_client_record((storage.foldername(name))[1]::uuid)
);
drop policy if exists "Agreement files staff upload" on storage.objects;
create policy "Agreement files staff upload" on storage.objects for insert to authenticated with check (
  bucket_id='client-agreements' and public.is_mketics_admin_or_staff()
);
drop policy if exists "Agreement files staff delete" on storage.objects;
create policy "Agreement files staff delete" on storage.objects for delete to authenticated using (
  bucket_id='client-agreements' and public.is_mketics_admin_or_staff()
);

create or replace function public.issue_client_agreement(target_agreement_id uuid)
returns public.client_agreements language plpgsql security definer set search_path=public as $$
declare a public.client_agreements;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  select * into a from public.client_agreements where id=target_agreement_id for update;
  if not found then raise exception 'Agreement not found'; end if;
  if not exists(select 1 from public.agreement_versions v where v.agreement_id=a.id and v.version_number=a.current_version) then raise exception 'Upload the current agreement version before issuing'; end if;
  update public.client_agreements set status='sent', sent_at=now(), first_viewed_at=null, decided_at=null,
    signer_name=null, signer_position=null, decision_comments=null, updated_at=now()
  where id=a.id returning * into a;
  insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email)
  values(a.id,a.client_id,a.current_version,'sent',auth.uid(),auth.jwt()->>'email');
  return a;
end; $$;

create or replace function public.add_agreement_version(target_agreement_id uuid, new_file_name text, new_file_size bigint, new_mime_type text, new_storage_path text)
returns public.client_agreements language plpgsql security definer set search_path=public as $$
declare a public.client_agreements; next_version integer;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  select * into a from public.client_agreements where id=target_agreement_id for update;
  if not found then raise exception 'Agreement not found'; end if;
  select coalesce(max(version_number),0)+1 into next_version from public.agreement_versions where agreement_id=a.id;
  insert into public.agreement_versions(agreement_id,client_id,version_number,file_name,file_size,mime_type,storage_path,uploaded_by)
  values(a.id,a.client_id,next_version,new_file_name,new_file_size,new_mime_type,new_storage_path,auth.uid());
  update public.client_agreements set current_version=next_version,status='draft',sent_at=null,first_viewed_at=null,decided_at=null,
    signer_name=null,signer_position=null,decision_comments=null,updated_at=now() where id=a.id returning * into a;
  insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email)
  values(a.id,a.client_id,next_version,'version_added',auth.uid(),auth.jwt()->>'email');
  return a;
end; $$;

create or replace function public.mark_agreement_viewed(target_agreement_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare a public.client_agreements;
begin
  select * into a from public.client_agreements where id=target_agreement_id and status in ('sent','viewed') and public.can_access_client_record(client_id) for update;
  if not found then raise exception 'Agreement unavailable'; end if;
  if a.first_viewed_at is null then
    update public.client_agreements set status='viewed',first_viewed_at=now(),updated_at=now() where id=a.id;
    insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email)
    values(a.id,a.client_id,a.current_version,'viewed',auth.uid(),auth.jwt()->>'email');
  end if;
end; $$;

create or replace function public.decide_client_agreement(target_agreement_id uuid, decision_value text, signer_full_name text, signer_capacity text default null, decision_comments text default null)
returns public.client_agreements language plpgsql security definer set search_path=public as $$
declare a public.client_agreements;
begin
  if decision_value not in ('accepted','declined') then raise exception 'Invalid decision'; end if;
  if nullif(trim(signer_full_name),'') is null then raise exception 'Full legal name is required'; end if;
  select * into a from public.client_agreements where id=target_agreement_id and status in ('sent','viewed')
    and (expires_at is null or expires_at > now()) and public.can_access_client_record(client_id) for update;
  if not found then raise exception 'Agreement is unavailable or expired'; end if;
  if decision_value='declined' and nullif(trim(decision_comments),'') is null then raise exception 'A reason is required when declining'; end if;
  update public.client_agreements set status=decision_value,decided_at=now(),signer_name=trim(signer_full_name),
    signer_position=nullif(trim(signer_capacity),''),decision_comments=nullif(trim(decision_comments),''),
    decision_user_agent=coalesce(current_setting('request.headers',true)::jsonb->>'user-agent',''),updated_at=now()
  where id=a.id returning * into a;
  insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email,signer_name,signer_position,comments)
  values(a.id,a.client_id,a.current_version,decision_value,auth.uid(),auth.jwt()->>'email',a.signer_name,a.signer_position,a.decision_comments);
  return a;
end; $$;

create or replace function public.record_agreement_reminder(target_agreement_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare a public.client_agreements;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  update public.client_agreements set reminder_count=reminder_count+1,last_reminded_at=now(),updated_at=now()
  where id=target_agreement_id and status in ('sent','viewed') returning * into a;
  if not found then raise exception 'Only pending agreements can receive reminders'; end if;
  insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email)
  values(a.id,a.client_id,a.current_version,'reminder',auth.uid(),auth.jwt()->>'email');
end; $$;

create or replace function public.expire_due_client_agreements()
returns integer language plpgsql security definer set search_path=public as $$
declare affected integer;
begin
  if not public.is_mketics_admin_or_staff() then raise exception 'Not authorised'; end if;
  with expired as (
    update public.client_agreements set status='expired',updated_at=now()
    where status in ('sent','viewed') and expires_at <= now()
    returning id,client_id,current_version
  ), logged as (
    insert into public.agreement_audit_log(agreement_id,client_id,version_number,event_type,actor_id,actor_email)
    select id,client_id,current_version,'expired',auth.uid(),auth.jwt()->>'email' from expired returning 1
  ) select count(*) into affected from logged;
  return affected;
end; $$;

revoke all on function public.issue_client_agreement(uuid) from public;
revoke all on function public.add_agreement_version(uuid,text,bigint,text,text) from public;
revoke all on function public.mark_agreement_viewed(uuid) from public;
revoke all on function public.decide_client_agreement(uuid,text,text,text,text) from public;
revoke all on function public.record_agreement_reminder(uuid) from public;
revoke all on function public.expire_due_client_agreements() from public;
grant execute on function public.issue_client_agreement(uuid) to authenticated;
grant execute on function public.add_agreement_version(uuid,text,bigint,text,text) to authenticated;
grant execute on function public.mark_agreement_viewed(uuid) to authenticated;
grant execute on function public.decide_client_agreement(uuid,text,text,text,text) to authenticated;
grant execute on function public.record_agreement_reminder(uuid) to authenticated;
grant execute on function public.expire_due_client_agreements() to authenticated;
