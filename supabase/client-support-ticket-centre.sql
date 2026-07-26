-- MKETICS Step 75: Client Support Ticket Centre
-- Run in Supabase SQL Editor. Safe to rerun.

alter table public.support_tickets
  add column if not exists ticket_number text,
  add column if not exists due_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists first_response_at timestamptz;

create sequence if not exists public.support_ticket_number_seq start 1001;

create or replace function public.set_support_ticket_number()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.ticket_number is null then
    new.ticket_number := 'MKT-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.support_ticket_number_seq')::text, 5, '0');
  end if;
  if new.due_at is null then
    new.due_at := now() + case new.priority::text
      when 'urgent' then interval '4 hours'
      when 'high' then interval '1 day'
      when 'normal' then interval '3 days'
      else interval '5 days'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists set_support_ticket_number_trigger on public.support_tickets;
create trigger set_support_ticket_number_trigger
before insert on public.support_tickets
for each row execute function public.set_support_ticket_number();

update public.support_tickets
set ticket_number = 'MKT-LEGACY-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where ticket_number is null;

create unique index if not exists support_tickets_ticket_number_idx
  on public.support_tickets(ticket_number);
create index if not exists support_tickets_due_idx
  on public.support_tickets(status, due_at);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  author_role text not null,
  message text not null,
  is_internal boolean not null default false,
  attachment_path text,
  attachment_name text,
  attachment_size bigint,
  created_at timestamptz not null default now(),
  constraint support_ticket_message_role_check check (author_role in ('client', 'staff', 'admin')),
  constraint support_ticket_attachment_size_check check (attachment_size is null or attachment_size <= 10485760)
);

create index if not exists support_ticket_messages_ticket_idx
  on public.support_ticket_messages(ticket_id, created_at);

alter table public.support_ticket_messages enable row level security;
grant select, insert on public.support_ticket_messages to authenticated;
grant select, insert, update on public.support_tickets to authenticated;
grant usage, select on sequence public.support_ticket_number_seq to authenticated;

drop policy if exists "Clients read own ticket messages" on public.support_ticket_messages;
create policy "Clients read own ticket messages"
on public.support_ticket_messages for select to authenticated
using (
  is_internal = false
  and exists (
    select 1 from public.support_tickets t
    where t.id = support_ticket_messages.ticket_id
      and public.can_access_client_record(t.client_id)
  )
);

drop policy if exists "Clients reply to own tickets" on public.support_ticket_messages;
create policy "Clients reply to own tickets"
on public.support_ticket_messages for insert to authenticated
with check (
  author_id = auth.uid()
  and author_role = 'client'
  and is_internal = false
  and exists (
    select 1 from public.support_tickets t
    where t.id = support_ticket_messages.ticket_id
      and public.can_access_client_record(t.client_id)
      and t.status::text <> 'closed'
  )
);

drop policy if exists "Staff manage ticket messages" on public.support_ticket_messages;
create policy "Staff manage ticket messages"
on public.support_ticket_messages for all to authenticated
using (public.is_mketics_admin_or_staff())
with check (
  public.is_mketics_admin_or_staff()
  and author_id = auth.uid()
  and author_role in ('staff', 'admin')
);

drop policy if exists "Clients update eligible own tickets" on public.support_tickets;
create policy "Clients update eligible own tickets"
on public.support_tickets for update to authenticated
using (
  public.can_access_client_record(client_id)
  and status::text in ('waiting_for_client', 'resolved')
)
with check (
  public.can_access_client_record(client_id)
  and status::text in ('open', 'in_progress')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mketics-support', 'mketics-support', false, 10485760, null)
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "Clients upload own ticket attachments" on storage.objects;
create policy "Clients upload own ticket attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'mketics-support'
  and (storage.foldername(name))[1] = 'clients'
  and (storage.foldername(name))[3] = 'tickets'
  and exists (
    select 1 from public.clients c
    where c.id::text = (storage.foldername(name))[2]
      and public.can_access_client_record(c.id)
  )
);

drop policy if exists "Ticket participants read attachments" on storage.objects;
create policy "Ticket participants read attachments"
on storage.objects for select to authenticated
using (
  bucket_id = 'mketics-support'
  and (
    public.is_mketics_admin_or_staff()
    or exists (
      select 1 from public.support_ticket_messages m
      join public.support_tickets t on t.id = m.ticket_id
      where m.attachment_path = storage.objects.name
        and m.is_internal = false
        and public.can_access_client_record(t.client_id)
    )
  )
);

drop policy if exists "Staff upload ticket attachments" on storage.objects;
create policy "Staff upload ticket attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'mketics-support'
  and public.is_mketics_admin_or_staff()
);
