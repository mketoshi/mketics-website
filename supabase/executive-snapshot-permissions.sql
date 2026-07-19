-- MKETICS Step 64: Executive snapshot permissions
-- Allows authenticated MKETICS admin/staff users to read business data and save executive snapshot document records.

grant select on table public.leads to authenticated;
grant select on table public.lead_notes to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.quotes to authenticated;
grant select on table public.support_tickets to authenticated;
grant select, insert on table public.documents to authenticated;
grant select on table public.settings to authenticated;
