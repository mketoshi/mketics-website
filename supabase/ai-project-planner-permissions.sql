-- MKETICS Step 56: AI project planner permissions
-- Run this only if the AI Project Planner cannot load projects, save AI logs,
-- save planning documents, or apply planning summaries to projects.

grant select, insert, update, delete on table public.ai_logs to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.quotes to authenticated;
grant select, insert, update, delete on table public.support_tickets to authenticated;
grant select, insert, update, delete on table public.documents to authenticated;
