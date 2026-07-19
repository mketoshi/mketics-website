-- MKETICS Step 70: Client portal quote acceptance and invoice payment requests
-- Adds:
-- - Client quote acceptance / changes / question / invoice request records
-- - Client invoice payment request records
-- - Secure RPC to update a client's own quote when accepted/rejected

-- 1. Required grants
grant usage on schema public to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.quotes to authenticated;
grant select, insert, update on table public.settings to authenticated;

-- 2. Helper function for signed-in portal users
create or replace function public.is_client_portal_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('client', 'admin', 'staff')
  );
$$;

-- 3. Client can read own quote records
-- Existing admin policy remains unchanged.
drop policy if exists "Client portal can read own quote records" on public.quotes;
create policy "Client portal can read own quote records"
on public.quotes
for select
to authenticated
using (
  client_id in (
    select id
    from public.clients
    where profile_id = auth.uid()
  )
);

-- 4. Settings policies for quote responses and payment requests
drop policy if exists "Client portal can read quote and payment request settings" on public.settings;
create policy "Client portal can read quote and payment request settings"
on public.settings
for select
to authenticated
using (
  setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1'
  )
  and public.is_client_portal_user()
);

drop policy if exists "Client portal can create quote and payment request settings" on public.settings;
create policy "Client portal can create quote and payment request settings"
on public.settings
for insert
to authenticated
with check (
  setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1'
  )
  and public.is_client_portal_user()
);

drop policy if exists "Client portal can update quote and payment request settings" on public.settings;
create policy "Client portal can update quote and payment request settings"
on public.settings
for update
to authenticated
using (
  setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1'
  )
  and public.is_client_portal_user()
)
with check (
  setting_key in (
    'client_portal_quote_responses_v1',
    'client_portal_invoice_payment_requests_v1'
  )
  and public.is_client_portal_user()
);

-- 5. Secure RPC: client submits quote response and optionally updates quote status
create or replace function public.client_portal_submit_quote_response(
  p_quote_id uuid,
  p_response_type text,
  p_feedback text default '',
  p_request_invoice boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_client public.clients%rowtype;
  target_quote public.quotes%rowtype;
  response_record jsonb;
  current_responses jsonb;
  next_status public.quote_status;
  result_quote jsonb;
begin
  select *
  into current_client
  from public.clients
  where profile_id = auth.uid()
  limit 1;

  if current_client.id is null then
    raise exception 'No linked client record found for this portal account.';
  end if;

  select *
  into target_quote
  from public.quotes
  where id = p_quote_id
    and client_id = current_client.id
  limit 1;

  if target_quote.id is null then
    raise exception 'Quote not found or not linked to this client account.';
  end if;

  if p_response_type not in ('accepted', 'changes_requested', 'question', 'request_invoice', 'rejected') then
    raise exception 'Invalid quote response type.';
  end if;

  next_status := target_quote.status;

  if p_response_type = 'accepted' then
    next_status := 'accepted'::public.quote_status;
  elsif p_response_type = 'rejected' then
    next_status := 'rejected'::public.quote_status;
  end if;

  update public.quotes
  set
    status = next_status,
    accepted_at = case
      when p_response_type = 'accepted' then now()
      else accepted_at
    end,
    rejected_at = case
      when p_response_type = 'rejected' then now()
      else rejected_at
    end,
    updated_at = now()
  where id = target_quote.id
  returning * into target_quote;

  response_record := jsonb_build_object(
    'id', gen_random_uuid()::text,
    'clientId', current_client.id::text,
    'quoteId', target_quote.id::text,
    'quoteNumber', coalesce(target_quote.quote_number, 'Quote'),
    'quoteTitle', coalesce(target_quote.title, 'MKETICS Quote'),
    'responseType', p_response_type,
    'feedback', coalesce(p_feedback, ''),
    'requestInvoice', coalesce(p_request_invoice, false) or p_response_type = 'request_invoice',
    'clientName', coalesce(current_client.full_name, 'Client'),
    'clientEmail', coalesce(current_client.email, ''),
    'createdAt', now(),
    'updatedAt', now()
  );

  select setting_value
  into current_responses
  from public.settings
  where setting_key = 'client_portal_quote_responses_v1'
  limit 1;

  if current_responses is null or jsonb_typeof(current_responses) <> 'array' then
    current_responses := '[]'::jsonb;
  end if;

  insert into public.settings (setting_key, setting_value, description, updated_at)
  values (
    'client_portal_quote_responses_v1',
    jsonb_build_array(response_record) || current_responses,
    'MKETICS client portal quote acceptance, change requests, questions and invoice requests.',
    now()
  )
  on conflict (setting_key) do update
  set
    setting_value = excluded.setting_value,
    description = excluded.description,
    updated_at = now();

  result_quote := jsonb_build_object(
    'id', target_quote.id::text,
    'status', target_quote.status::text,
    'accepted_at', target_quote.accepted_at,
    'rejected_at', target_quote.rejected_at,
    'updated_at', target_quote.updated_at
  );

  return jsonb_build_object(
    'response', response_record,
    'quote', result_quote
  );
end;
$$;

grant execute on function public.client_portal_submit_quote_response(uuid, text, text, boolean) to authenticated;

-- 6. Optional convenience rows so settings exist before first use
insert into public.settings (setting_key, setting_value, description)
values
  ('client_portal_quote_responses_v1', '[]'::jsonb, 'MKETICS client portal quote responses.'),
  ('client_portal_invoice_payment_requests_v1', '[]'::jsonb, 'MKETICS client portal invoice payment requests.')
on conflict (setting_key) do nothing;

-- 7. Reload PostgREST schema cache
select pg_notify('pgrst', 'reload schema');
