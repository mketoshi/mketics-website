-- Read-only preflight. This file intentionally raises an error when the
-- existing database is incompatible with the upgrade pack.
do $$
declare
  missing text[];
begin
  select array_agg(required_name order by required_name)
  into missing
  from (
    values
      ('public.profiles'),
      ('public.clients'),
      ('public.projects'),
      ('public.quotes'),
      ('public.support_tickets'),
      ('public.documents'),
      ('public.settings')
  ) required(required_name)
  where to_regclass(required_name) is null;

  if missing is not null then
    raise exception 'Missing required relations: %', array_to_string(missing, ', ');
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'settings'
      and column_name = 'setting_key'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'settings'
      and column_name = 'setting_value' and data_type = 'jsonb'
  ) then
    raise exception 'public.settings must contain setting_key and JSONB setting_value';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'clients'
      and column_name = 'profile_id'
  ) then
    raise exception 'public.clients.profile_id is required';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quotes'
      and column_name = 'accepted_at'
  ) then
    raise exception 'public.quotes.accepted_at is required';
  end if;
end
$$;

select
  current_database() as database_name,
  now() as checked_at,
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.clients) as clients,
  (select count(*) from public.clients where profile_id is not null) as linked_clients;

