begin;

create table if not exists public.client_quote_responses (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  response_type text not null check (
    response_type in (
      'accepted', 'rejected', 'changes_requested', 'question', 'request_invoice'
    )
  ),
  message text not null default '' check (char_length(message) <= 5000),
  request_invoice boolean not null default false,
  status text not null default 'new' check (status in ('new', 'reviewed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_quote_responses_client_idx
  on public.client_quote_responses(client_id, created_at desc);
create index if not exists client_quote_responses_quote_idx
  on public.client_quote_responses(quote_id, created_at desc);
alter table public.client_quote_responses enable row level security;

drop policy if exists "Clients can read own quote responses"
  on public.client_quote_responses;
create policy "Clients can read own quote responses"
on public.client_quote_responses for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = client_quote_responses.client_id and c.profile_id = auth.uid()
  )
);

drop policy if exists "Admins can manage quote responses"
  on public.client_quote_responses;
create policy "Admins can manage quote responses"
on public.client_quote_responses for all to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

grant select on public.client_quote_responses to authenticated;
revoke insert, update, delete on public.client_quote_responses from authenticated;

create or replace function public.submit_client_portal_quote_response(
  p_quote_id uuid,
  p_response_type text,
  p_message text default '',
  p_request_invoice boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_type text := lower(btrim(coalesce(p_response_type, '')));
  v_row public.client_quote_responses;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;
  if v_type not in (
    'accepted', 'rejected', 'changes_requested', 'question', 'request_invoice'
  ) then
    raise exception 'Invalid quote response type.';
  end if;
  if char_length(coalesce(p_message, '')) > 5000 then
    raise exception 'Message exceeds 5000 characters.';
  end if;

  select c.id into v_client_id
  from public.clients c
  where c.profile_id = auth.uid()
  limit 1;

  if v_client_id is null then
    raise exception 'No linked client record found.';
  end if;
  if not exists (
    select 1 from public.quotes q
    where q.id = p_quote_id and q.client_id = v_client_id
  ) then
    raise exception 'Quote not found or not linked to this client.';
  end if;

  insert into public.client_quote_responses(
    quote_id, client_id, response_type, message, request_invoice
  ) values (
    p_quote_id, v_client_id, v_type, btrim(coalesce(p_message, '')),
    coalesce(p_request_invoice, false) or v_type = 'request_invoice'
  ) returning * into v_row;

  if v_type = 'accepted' then
    update public.quotes
    set status = 'accepted'::public.quote_status,
        accepted_at = coalesce(accepted_at, now()),
        rejected_at = null,
        updated_at = now()
    where id = p_quote_id and client_id = v_client_id;
  elsif v_type = 'rejected' then
    update public.quotes
    set status = 'rejected'::public.quote_status,
        rejected_at = coalesce(rejected_at, now()),
        accepted_at = null,
        updated_at = now()
    where id = p_quote_id and client_id = v_client_id;
  end if;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.get_client_portal_quote_responses()
returns setof public.client_quote_responses
language sql
stable
security definer
set search_path = ''
as $$
  select r.*
  from public.client_quote_responses r
  join public.clients c on c.id = r.client_id
  where c.profile_id = auth.uid()
  order by r.created_at desc, r.id;
$$;

revoke all on function public.submit_client_portal_quote_response(uuid,text,text,boolean)
  from public, anon, authenticated;
revoke all on function public.get_client_portal_quote_responses()
  from public, anon, authenticated;
grant execute on function public.submit_client_portal_quote_response(uuid,text,text,boolean)
  to authenticated;
grant execute on function public.get_client_portal_quote_responses()
  to authenticated;

commit;
select pg_notify('pgrst', 'reload schema');
