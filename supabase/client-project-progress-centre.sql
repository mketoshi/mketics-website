-- MKETICS Step 77: Client Project Progress Centre
-- Safe to rerun after the core clients/projects/profiles schema exists.

create extension if not exists pgcrypto;

create or replace function public.is_mketics_admin_or_staff()
returns boolean language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text in ('admin', 'staff')
  );
$$;

create or replace function public.can_access_client_record(target_client_id uuid)
returns boolean language sql security definer set search_path = public
as $$
  select public.is_mketics_admin_or_staff() or exists (
    select 1 from public.clients c
    where c.id = target_client_id
      and (
        c.profile_id = auth.uid()
        or lower(coalesce(c.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

alter table public.projects add column if not exists progress_percent integer not null default 0;
alter table public.projects add column if not exists revised_due_date date;
alter table public.projects add column if not exists delay_reason text;
alter table public.projects drop constraint if exists projects_progress_percent_check;
alter table public.projects add constraint projects_progress_percent_check check (progress_percent between 0 and 100);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','in_progress','awaiting_approval','completed','delayed','cancelled')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  start_date date,
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  requires_client_approval boolean not null default false,
  client_decision text check (client_decision is null or client_decision in ('pending','approved','changes_requested','question')),
  client_feedback text,
  client_responded_at timestamptz,
  deliverable_title text,
  deliverable_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  impact text,
  mitigation text,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','monitoring','resolved','accepted')),
  client_visible boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  activity_type text not null default 'progress_update',
  title text not null,
  message text,
  client_visible boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_milestones_project_idx on public.project_milestones(project_id, sort_order);
create index if not exists project_risks_project_idx on public.project_risks(project_id, created_at desc);
create index if not exists project_activities_project_idx on public.project_activities(project_id, created_at desc);

alter table public.project_milestones enable row level security;
alter table public.project_risks enable row level security;
alter table public.project_activities enable row level security;

grant select on public.projects, public.project_milestones, public.project_risks, public.project_activities to authenticated;
grant insert, update, delete on public.project_milestones, public.project_risks, public.project_activities to authenticated;

drop policy if exists "Project progress staff manage milestones" on public.project_milestones;
create policy "Project progress staff manage milestones" on public.project_milestones for all to authenticated
using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read linked milestones" on public.project_milestones;
create policy "Clients read linked milestones" on public.project_milestones for select to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and public.can_access_client_record(p.client_id)));

drop policy if exists "Project progress staff manage risks" on public.project_risks;
create policy "Project progress staff manage risks" on public.project_risks for all to authenticated
using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read visible linked risks" on public.project_risks;
create policy "Clients read visible linked risks" on public.project_risks for select to authenticated
using (client_visible and exists (select 1 from public.projects p where p.id = project_id and public.can_access_client_record(p.client_id)));

drop policy if exists "Project progress staff manage activities" on public.project_activities;
create policy "Project progress staff manage activities" on public.project_activities for all to authenticated
using (public.is_mketics_admin_or_staff()) with check (public.is_mketics_admin_or_staff());
drop policy if exists "Clients read visible linked activities" on public.project_activities;
create policy "Clients read visible linked activities" on public.project_activities for select to authenticated
using (client_visible and exists (select 1 from public.projects p where p.id = project_id and public.can_access_client_record(p.client_id)));

create or replace function public.submit_client_milestone_response(
  target_milestone_id uuid,
  response_decision text,
  response_feedback text default null
) returns public.project_milestones
language plpgsql security definer set search_path = public
as $$
declare result public.project_milestones;
begin
  if response_decision not in ('approved','changes_requested','question') then
    raise exception 'Invalid milestone response';
  end if;
  if not exists (
    select 1 from public.project_milestones m
    join public.projects p on p.id = m.project_id
    where m.id = target_milestone_id
      and m.requires_client_approval
      and public.can_access_client_record(p.client_id)
  ) then raise exception 'Milestone is unavailable'; end if;

  update public.project_milestones
  set client_decision = response_decision,
      client_feedback = nullif(trim(response_feedback), ''),
      client_responded_at = now(),
      status = case when response_decision = 'approved' then 'completed' else 'awaiting_approval' end,
      completed_at = case when response_decision = 'approved' then coalesce(completed_at, now()) else completed_at end,
      updated_at = now()
  where id = target_milestone_id returning * into result;

  insert into public.project_activities(project_id, milestone_id, activity_type, title, message, client_visible)
  values (result.project_id, result.id, 'client_response', 'Client milestone response',
          response_decision || coalesce(': ' || nullif(trim(response_feedback), ''), ''), true);
  return result;
end;
$$;

revoke all on function public.is_mketics_admin_or_staff() from public;
revoke all on function public.can_access_client_record(uuid) from public;
revoke all on function public.submit_client_milestone_response(uuid,text,text) from public;
grant execute on function public.is_mketics_admin_or_staff() to authenticated;
grant execute on function public.can_access_client_record(uuid) to authenticated;
grant execute on function public.submit_client_milestone_response(uuid,text,text) to authenticated;
