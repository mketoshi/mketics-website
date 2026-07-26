-- Use only after restoring the frontend to a version that does not call these RPCs.
begin;

drop function if exists public.update_client_portal_profile(text,text,text);
drop trigger if exists create_portal_profile_after_signup on auth.users;
drop function if exists public.handle_new_portal_user();
drop function if exists public.can_access_invoice_receipt_storage_path(text);
drop function if exists public.mark_client_portal_messages_read(uuid);
drop function if exists public.reply_client_portal_message(uuid,text);
drop function if exists public.send_client_portal_message(uuid,text,text);
drop function if exists public.get_client_portal_quote_responses();
drop function if exists
  public.submit_client_portal_quote_response(uuid,text,text,boolean);
drop function if exists public.get_client_portal_invoice_records();

drop table if exists public.client_messages;
drop table if exists public.client_quote_responses;

drop policy if exists "Client portal can read own documents" on public.documents;
drop policy if exists "Client portal can read own support tickets"
  on public.support_tickets;
drop policy if exists "Client portal can read own quotes" on public.quotes;
drop policy if exists "Client portal can read own projects" on public.projects;
drop policy if exists "Client portal can read own client record" on public.clients;
drop policy if exists "Client portal can read own profile" on public.profiles;

commit;
select pg_notify('pgrst', 'reload schema');
