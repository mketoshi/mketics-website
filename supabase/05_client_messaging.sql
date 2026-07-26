begin;

create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete restrict,
  sender_role text not null check (sender_role in ('client', 'admin', 'staff')),
  subject text not null default 'Client message'
    check (char_length(btrim(subject)) between 1 and 200),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'read', 'archived')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_messages_conversation_idx
  on public.client_messages(conversation_id, created_at);
create index if not exists client_messages_client_idx
  on public.client_messages(client_id, created_at desc);
alter table public.client_messages enable row level security;

drop policy if exists "Clients can read own messages" on public.client_messages;
drop policy if exists "Clients can send own messages" on public.client_messages;
drop policy if exists "Admins can manage client messages" on public.client_messages;

create policy "Clients can read own messages"
on public.client_messages for select to authenticated
using (
  exists (
    select 1 from public.clients c
    where c.id = client_messages.client_id and c.profile_id = auth.uid()
  )
);
create policy "Admins can read client messages"
on public.client_messages for select to authenticated
using (public.is_admin_or_staff());

grant select on public.client_messages to authenticated;
revoke insert, update, delete on public.client_messages from authenticated;

create or replace function public.send_client_portal_message(
  p_conversation_id uuid default null,
  p_subject text default 'Client message',
  p_body text default null
)
returns public.client_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_conversation_id uuid;
  v_row public.client_messages;
begin
  select c.id into v_client_id from public.clients c
  where c.profile_id = auth.uid() limit 1;
  if v_client_id is null then raise exception 'No linked client record found.'; end if;
  if char_length(btrim(coalesce(p_subject, ''))) not between 1 and 200 then
    raise exception 'Subject must contain 1 to 200 characters.';
  end if;
  if char_length(btrim(coalesce(p_body, ''))) not between 1 and 10000 then
    raise exception 'Message must contain 1 to 10000 characters.';
  end if;

  if p_conversation_id is null then
    v_conversation_id := gen_random_uuid();
  elsif exists (
    select 1 from public.client_messages m
    where m.conversation_id = p_conversation_id and m.client_id = v_client_id
  ) then
    v_conversation_id := p_conversation_id;
  else
    raise exception 'Conversation not found or not linked to this client.';
  end if;

  insert into public.client_messages(
    conversation_id, client_id, sender_profile_id, sender_role, subject, body
  ) values (
    v_conversation_id, v_client_id, auth.uid(), 'client',
    btrim(p_subject), btrim(p_body)
  ) returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.reply_client_portal_message(
  p_conversation_id uuid,
  p_body text
)
returns public.client_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_subject text;
  v_role text;
  v_row public.client_messages;
begin
  if not public.is_admin_or_staff() then raise exception 'Access denied.'; end if;
  if char_length(btrim(coalesce(p_body, ''))) not between 1 and 10000 then
    raise exception 'Message must contain 1 to 10000 characters.';
  end if;
  select m.client_id, m.subject into v_client_id, v_subject
  from public.client_messages m
  where m.conversation_id = p_conversation_id
  order by m.created_at limit 1;
  if v_client_id is null then raise exception 'Conversation not found.'; end if;
  select p.role::text into v_role from public.profiles p where p.id = auth.uid();

  insert into public.client_messages(
    conversation_id, client_id, sender_profile_id, sender_role, subject, body
  ) values (
    p_conversation_id, v_client_id, auth.uid(), v_role, v_subject, btrim(p_body)
  ) returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.mark_client_portal_messages_read(
  p_conversation_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  if public.is_admin_or_staff() then
    update public.client_messages m
    set status = 'read', read_at = coalesce(read_at, now()), updated_at = now()
    where m.conversation_id = p_conversation_id
      and m.sender_role = 'client' and m.status <> 'archived';
  else
    update public.client_messages m
    set status = 'read', read_at = coalesce(read_at, now()), updated_at = now()
    where m.conversation_id = p_conversation_id
      and m.sender_role in ('admin', 'staff') and m.status <> 'archived'
      and exists (
        select 1 from public.clients c
        where c.id = m.client_id and c.profile_id = auth.uid()
      );
  end if;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.send_client_portal_message(uuid,text,text)
  from public, anon, authenticated;
revoke all on function public.reply_client_portal_message(uuid,text)
  from public, anon, authenticated;
revoke all on function public.mark_client_portal_messages_read(uuid)
  from public, anon, authenticated;
grant execute on function public.send_client_portal_message(uuid,text,text)
  to authenticated;
grant execute on function public.reply_client_portal_message(uuid,text)
  to authenticated;
grant execute on function public.mark_client_portal_messages_read(uuid)
  to authenticated;

commit;
select pg_notify('pgrst', 'reload schema');

