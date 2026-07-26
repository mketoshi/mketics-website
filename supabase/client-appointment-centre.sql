-- MKETICS Step 76: Client Appointment and Consultation Booking
-- Run in Supabase SQL Editor after the client portal foundation migrations.
-- Safe to rerun.

create sequence if not exists public.client_appointment_number_seq start 1001;

create table if not exists public.client_appointments (
  id uuid primary key default gen_random_uuid(),
  appointment_number text unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  appointment_type text not null default 'consultation'
    check (appointment_type in ('consultation', 'technical_support', 'project_meeting', 'follow_up')),
  meeting_method text not null default 'online'
    check (meeting_method in ('online', 'telephone', 'office', 'onsite')),
  subject text not null,
  details text,
  location text,
  preferred_start timestamptz not null,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  duration_minutes integer not null default 60 check (duration_minutes in (30, 60, 90, 120)),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  assigned_to uuid references public.profiles(id) on delete set null,
  meeting_link text,
  admin_notes text,
  reschedule_reason text,
  cancellation_reason text,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_scheduled_range_check check (
    scheduled_end is null or scheduled_start is null or scheduled_end > scheduled_start
  )
);

create or replace function public.set_client_appointment_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.appointment_number is null then
    new.appointment_number := 'APT-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.client_appointment_number_seq')::text, 5, '0');
  end if;
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_client_appointment_defaults_trigger on public.client_appointments;
create trigger set_client_appointment_defaults_trigger
before insert or update on public.client_appointments
for each row execute function public.set_client_appointment_defaults();

create index if not exists client_appointments_client_idx
  on public.client_appointments(client_id, created_at desc);
create index if not exists client_appointments_schedule_idx
  on public.client_appointments(status, scheduled_start, scheduled_end);
create index if not exists client_appointments_staff_idx
  on public.client_appointments(assigned_to, scheduled_start);

alter table public.client_appointments enable row level security;
grant select, insert, update on public.client_appointments to authenticated;
grant usage, select on sequence public.client_appointment_number_seq to authenticated;

drop policy if exists "Clients read own appointments" on public.client_appointments;
create policy "Clients read own appointments"
on public.client_appointments for select to authenticated
using (public.can_access_client_record(client_id));

drop policy if exists "Clients request own appointments" on public.client_appointments;
create policy "Clients request own appointments"
on public.client_appointments for insert to authenticated
with check (
  public.can_access_client_record(client_id)
  and created_by = auth.uid()
  and status = 'pending'
  and scheduled_start is null
  and scheduled_end is null
  and assigned_to is null
  and meeting_link is null
);

drop policy if exists "Clients cancel own appointments" on public.client_appointments;

create or replace function public.cancel_own_client_appointment(appointment_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.client_appointments
  set
    status = 'cancelled',
    cancellation_reason = 'Cancelled by client',
    cancelled_at = now()
  where id = appointment_id_input
    and public.can_access_client_record(client_id)
    and status in ('pending', 'confirmed', 'rescheduled');

  if not found then
    raise exception 'Appointment cannot be cancelled or is not accessible.';
  end if;
end;
$$;

revoke all on function public.cancel_own_client_appointment(uuid) from public;
grant execute on function public.cancel_own_client_appointment(uuid) to authenticated;

drop policy if exists "Staff manage appointments" on public.client_appointments;
create policy "Staff manage appointments"
on public.client_appointments for all to authenticated
using (public.is_mketics_admin_or_staff())
with check (public.is_mketics_admin_or_staff());

comment on table public.client_appointments is
  'Client consultation, technical visit and project meeting bookings for MKETICS.';
