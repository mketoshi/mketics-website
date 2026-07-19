-- MKETICS Step 58: Project time tracking and delivery reports permissions
-- Used by: ProjectTimeReports.jsx

-- Time entries are stored in public.settings under setting_key = project_time_tracking_v1.
-- Delivery reports are saved as records in public.documents.

grant select, insert, update, delete on table public.settings to authenticated;
grant select, insert, update, delete on table public.documents to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.support_tickets to authenticated;
