-- MKETICS Step 62: Business reports dashboard permissions
-- Reports read operational data and can save monthly summaries as document records.

grant select on table public.leads to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
grant select on table public.support_tickets to authenticated;
grant select, insert, update, delete on table public.documents to authenticated;
grant select, insert, update, delete on table public.settings to authenticated;
