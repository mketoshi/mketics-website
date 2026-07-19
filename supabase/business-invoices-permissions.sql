-- MKETICS Step 60: Invoice builder and payment tracking permissions
-- Run this in Supabase SQL Editor if invoice records or synced payment records do not save.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.settings to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.quotes to authenticated;
