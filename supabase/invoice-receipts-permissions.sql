-- MKETICS Step 61: Invoice receipt and payment proof permissions
-- Run this if receipt, proof document, settings or storage actions fail.

-- Settings table stores invoice and finance records.
grant select, insert, update, delete on table public.settings to authenticated;

-- Documents table stores proof of payment document records.
grant select, insert, update, delete on table public.documents to authenticated;

-- Keep related invoice context readable.
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;

-- Storage bucket and policies for private proof uploads.
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

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'mketics-documents',
  'mketics-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "MKETICS admins can read documents" on storage.objects;
drop policy if exists "MKETICS admins can upload documents" on storage.objects;
drop policy if exists "MKETICS admins can update documents" on storage.objects;
drop policy if exists "MKETICS admins can delete documents" on storage.objects;

create policy "MKETICS admins can read documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mketics-documents'
  and public.is_mketics_admin_or_staff()
);

create policy "MKETICS admins can upload documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mketics-documents'
  and public.is_mketics_admin_or_staff()
);

create policy "MKETICS admins can update documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'mketics-documents'
  and public.is_mketics_admin_or_staff()
)
with check (
  bucket_id = 'mketics-documents'
  and public.is_mketics_admin_or_staff()
);

create policy "MKETICS admins can delete documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'mketics-documents'
  and public.is_mketics_admin_or_staff()
);
