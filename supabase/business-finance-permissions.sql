-- MKETICS Step 59: Business finance dashboard permissions
-- Finance records are stored in the public.settings row:
-- setting_key = 'business_finance_records_v1'

grant select, insert, update, delete on table public.settings to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
