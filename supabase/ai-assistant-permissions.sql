-- MKETICS Step 55: AI assistant permissions
-- Run this only if the AI Assistant cannot save AI logs or create quote drafts.

grant select, insert, update, delete on table public.ai_logs to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.quotes to authenticated;
