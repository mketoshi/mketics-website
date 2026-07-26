begin;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('mketics-documents', 'mketics-documents', false, 10485760, null)
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Admins can view stored documents" on storage.objects;
drop policy if exists "Admins can upload stored documents" on storage.objects;
drop policy if exists "Admins can update stored documents" on storage.objects;
drop policy if exists "Admins can delete stored documents" on storage.objects;

create policy "Admins can view stored documents"
on storage.objects for select to authenticated
using (bucket_id = 'mketics-documents' and public.is_admin_or_staff());
create policy "Admins can upload stored documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'mketics-documents' and public.is_admin_or_staff());
create policy "Admins can update stored documents"
on storage.objects for update to authenticated
using (bucket_id = 'mketics-documents' and public.is_admin_or_staff())
with check (bucket_id = 'mketics-documents' and public.is_admin_or_staff());
create policy "Admins can delete stored documents"
on storage.objects for delete to authenticated
using (bucket_id = 'mketics-documents' and public.is_admin_or_staff());

create or replace function public.can_access_invoice_receipt_storage_path(
  target_storage_path text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    target_storage_path is not null
    and target_storage_path <> ''
    and exists (
      select 1
      from public.settings s
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(s.setting_value -> 'invoices') = 'array'
            then s.setting_value -> 'invoices'
          when jsonb_typeof(s.setting_value) = 'array'
            then s.setting_value
          else '[]'::jsonb
        end
      ) invoice_record
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(invoice_record -> 'receipts') = 'array'
          then invoice_record -> 'receipts' else '[]'::jsonb end
      ) receipt_record
      join public.clients c
        on coalesce(invoice_record ->> 'clientId',
          invoice_record ->> 'client_id') = c.id::text
      where s.setting_key in (
        'business_invoice_records_v1', 'business_invoices',
        'mketics_business_invoices', 'invoice_records', 'invoices'
      )
        and c.profile_id = auth.uid()
        and coalesce(receipt_record ->> 'proofStoragePath',
          receipt_record ->> 'proof_storage_path') = target_storage_path
    );
$$;

revoke all on function public.can_access_invoice_receipt_storage_path(text)
  from public, anon, authenticated;
grant execute on function public.can_access_invoice_receipt_storage_path(text)
  to authenticated;

drop policy if exists "Clients can read own storage documents" on storage.objects;
create policy "Clients can read own storage documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'mketics-documents'
  and exists (
    select 1
    from public.documents d
    join public.clients c on c.id = d.client_id
    where d.storage_path = storage.objects.name and c.profile_id = auth.uid()
  )
);

drop policy if exists "Clients can read invoice receipt proof files"
  on storage.objects;
create policy "Clients can read invoice receipt proof files"
on storage.objects for select to authenticated
using (
  bucket_id = 'mketics-documents'
  and public.can_access_invoice_receipt_storage_path(storage.objects.name)
);

commit;

