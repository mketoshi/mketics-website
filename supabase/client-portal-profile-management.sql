-- MKETICS Step 73: Secure client portal profile management
-- Allows an authenticated portal user to update only their own public contact fields.

alter table public.profiles
  add column if not exists billing_name text,
  add column if not exists billing_email text,
  add column if not exists billing_address text,
  add column if not exists tax_number text;

drop function if exists public.update_client_portal_profile(text, text, text);
drop function if exists public.update_client_portal_profile(text, text, text, text, text, text, text);

create or replace function public.update_client_portal_profile(
  profile_full_name text,
  profile_phone text default null,
  profile_organisation text default null,
  profile_billing_name text default null,
  profile_billing_email text default null,
  profile_billing_address text default null,
  profile_tax_number text default null
)
returns table (
  id uuid,
  full_name text,
  email text,
  role public.app_role,
  phone text,
  organisation text,
  billing_name text,
  billing_email text,
  billing_address text,
  tax_number text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if nullif(btrim(profile_full_name), '') is null then
    raise exception 'Full name is required.';
  end if;

  return query
  update public.profiles
  set
    full_name = btrim(profile_full_name),
    phone = nullif(btrim(profile_phone), ''),
    organisation = nullif(btrim(profile_organisation), ''),
    billing_name = nullif(btrim(profile_billing_name), ''),
    billing_email = nullif(lower(btrim(profile_billing_email)), ''),
    billing_address = nullif(btrim(profile_billing_address), ''),
    tax_number = nullif(btrim(profile_tax_number), ''),
    updated_at = now()
  where profiles.id = auth.uid()
  returning
    profiles.id,
    profiles.full_name,
    profiles.email,
    profiles.role,
    profiles.phone,
    profiles.organisation,
    profiles.billing_name,
    profiles.billing_email,
    profiles.billing_address,
    profiles.tax_number,
    profiles.created_at,
    profiles.updated_at;
end;
$$;

revoke all on function public.update_client_portal_profile(text, text, text, text, text, text, text) from public;
grant execute on function public.update_client_portal_profile(text, text, text, text, text, text, text) to authenticated;
