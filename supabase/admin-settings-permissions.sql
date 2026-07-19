-- MKETICS Step 65: Admin settings permissions
-- Allows authenticated MKETICS admin/staff users to manage company profile settings.

grant select, insert, update, delete on table public.settings to authenticated;
grant select, update on table public.profiles to authenticated;

-- Optional confirmation query
select setting_key, updated_at
from public.settings
where setting_key = 'mketics_admin_settings';
