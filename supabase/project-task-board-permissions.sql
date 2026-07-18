-- MKETICS Step 57: Project task board permissions
-- The task board stores project tasks in the public.settings JSON record.
-- Run this only if task board records do not save or load for authenticated admin users.

grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.settings to authenticated;
