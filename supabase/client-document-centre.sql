-- MKETICS Step 74: Secure Client Document Centre
-- Run once in Supabase SQL Editor. Safe to rerun.

alter table public.documents
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint,
  add column if not exists client_visible boolean not null default true,
  add column if not exists upload_status text not null default 'available',
  add column if not exists requested_due_at timestamptz,
  add column if not exists uploaded_by uuid references public.profiles(id) on delete set null;

alter table public.documents
  drop constraint if exists documents_upload_status_check;

alter table public.documents
  add constraint documents_upload_status_check
  check (upload_status in ('pending', 'requested', 'available', 'uploaded_by_client', 'archived'));

create index if not exists documents_client_visible_idx
  on public.documents (client_id, client_visible, created_at desc);

alter table public.documents enable row level security;
grant select, insert, update on public.documents to authenticated;

drop policy if exists "Clients can view shared documents" on public.documents;
create policy "Clients can view shared documents"
on public.documents
for select
to authenticated
using (
  client_visible = true
  and exists (
    select 1
    from public.clients c
    where c.id = documents.client_id
      and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can upload their documents" on public.documents;
create policy "Clients can upload their documents"
on public.documents
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and upload_status = 'uploaded_by_client'
  and client_visible = true
  and exists (
    select 1
    from public.clients c
    where c.id = documents.client_id
      and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can fulfil document requests" on public.documents;
create policy "Clients can fulfil document requests"
on public.documents
for update
to authenticated
using (
  upload_status = 'requested'
  and exists (
    select 1
    from public.clients c
    where c.id = documents.client_id
      and c.profile_id = auth.uid()
  )
)
with check (
  uploaded_by = auth.uid()
  and upload_status = 'uploaded_by_client'
  and client_visible = true
  and exists (
    select 1
    from public.clients c
    where c.id = documents.client_id
      and c.profile_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mketics-documents', 'mketics-documents', false, 10485760, null)
on conflict (id) do update
set public = false, file_size_limit = 10485760;

drop policy if exists "Clients can read their stored documents" on storage.objects;
create policy "Clients can read their stored documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mketics-documents'
  and (
    (
      (storage.foldername(name))[1] = 'clients'
      and exists (
        select 1
        from public.clients c
        where c.id::text = (storage.foldername(name))[2]
          and c.profile_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.documents d
      join public.clients c on c.id = d.client_id
      where d.storage_path = name
        and d.client_visible = true
        and c.profile_id = auth.uid()
    )
  )
);

drop policy if exists "Clients can upload their stored documents" on storage.objects;
create policy "Clients can upload their stored documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mketics-documents'
  and (storage.foldername(name))[1] = 'clients'
  and (storage.foldername(name))[3] = 'client-uploads'
  and exists (
    select 1
    from public.clients c
    where c.id::text = (storage.foldername(name))[2]
      and c.profile_id = auth.uid()
  )
);
