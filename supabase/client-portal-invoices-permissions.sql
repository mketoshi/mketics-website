-- MKETICS Step 68: Client portal invoice and receipt visibility
-- Purpose: return only the signed-in client's invoice records from the JSON invoice setting.

-- 1. Helper: returns true for admin/staff users.
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

-- 2. Helper: true when the authenticated user owns or matches a client record.
create or replace function public.can_access_client_record(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    where c.id = target_client_id
      and (
        c.profile_id = auth.uid()
        or lower(coalesce(c.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or public.is_mketics_admin_or_staff()
      )
  );
$$;

-- 3. Secure RPC: returns only invoice records whose clientId belongs to the signed-in user.
create or replace function public.get_client_portal_invoice_records()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_client_ids text[];
  invoice_records jsonb;
begin
  select coalesce(array_agg(c.id::text), array[]::text[])
  into allowed_client_ids
  from public.clients c
  where c.profile_id = auth.uid()
     or lower(coalesce(c.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
     or public.is_mketics_admin_or_staff();

  if coalesce(array_length(allowed_client_ids, 1), 0) = 0 then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(invoice_record order by coalesce(invoice_record ->> 'updatedAt', invoice_record ->> 'createdAt') desc), '[]'::jsonb)
  into invoice_records
  from public.settings s
  cross join lateral jsonb_array_elements(coalesce(s.setting_value -> 'invoices', '[]'::jsonb)) as invoice_record
  where s.setting_key = 'business_invoice_records_v1'
    and invoice_record ->> 'clientId' = any(allowed_client_ids);

  return coalesce(invoice_records, '[]'::jsonb);
end;
$$;

-- 4. Helper: allow clients to open proof files attached directly to their invoice receipts.
create or replace function public.can_access_invoice_receipt_storage_path(target_storage_path text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_client_ids text[];
  can_access boolean;
begin
  if target_storage_path is null or target_storage_path = '' then
    return false;
  end if;

  select coalesce(array_agg(c.id::text), array[]::text[])
  into allowed_client_ids
  from public.clients c
  where c.profile_id = auth.uid()
     or lower(coalesce(c.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
     or public.is_mketics_admin_or_staff();

  if coalesce(array_length(allowed_client_ids, 1), 0) = 0 then
    return false;
  end if;

  select exists (
    select 1
    from public.settings s
    cross join lateral jsonb_array_elements(coalesce(s.setting_value -> 'invoices', '[]'::jsonb)) as invoice_record
    cross join lateral jsonb_array_elements(coalesce(invoice_record -> 'receipts', '[]'::jsonb)) as receipt_record
    where s.setting_key = 'business_invoice_records_v1'
      and invoice_record ->> 'clientId' = any(allowed_client_ids)
      and receipt_record ->> 'proofStoragePath' = target_storage_path
  )
  into can_access;

  return coalesce(can_access, false);
end;
$$;

-- 5. Allow client users to execute the filtered invoice RPC.
grant execute on function public.get_client_portal_invoice_records() to authenticated;
grant execute on function public.can_access_invoice_receipt_storage_path(text) to authenticated;

-- 6. Keep ordinary client linked records readable.
grant select on table public.profiles to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
grant select on table public.documents to authenticated;
grant select, insert on table public.support_tickets to authenticated;

grant usage on schema storage to authenticated;
grant select on table storage.objects to authenticated;

-- 7. Storage policy for invoice receipt proof files stored in the private mketics-documents bucket.
drop policy if exists "Clients can read invoice receipt proof files" on storage.objects;
create policy "Clients can read invoice receipt proof files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mketics-documents'
  and public.can_access_invoice_receipt_storage_path(storage.objects.name)
);

-- 8. Validation.
select public.get_client_portal_invoice_records() as visible_client_invoices;
