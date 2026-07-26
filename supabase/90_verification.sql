-- Run after all migrations. All checks should return the expected result.
select
  to_regprocedure('public.get_client_portal_invoice_records()') is not null
    as invoice_rpc_exists,
  to_regprocedure(
    'public.submit_client_portal_quote_response(uuid,text,text,boolean)'
  ) is not null as quote_submit_rpc_exists,
  to_regprocedure('public.get_client_portal_quote_responses()') is not null
    as quote_history_rpc_exists,
  to_regprocedure('public.send_client_portal_message(uuid,text,text)') is not null
    as send_message_rpc_exists,
  to_regprocedure('public.reply_client_portal_message(uuid,text)') is not null
    as reply_message_rpc_exists,
  to_regprocedure('public.update_client_portal_profile(text,text,text)') is not null
    as profile_rpc_exists,
  to_regprocedure('public.handle_new_portal_user()') is not null
    as auth_profile_trigger_function_exists;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
    'profiles', 'clients', 'projects', 'quotes', 'support_tickets',
    'documents', 'client_quote_responses', 'client_messages', 'objects'
  )
order by schemaname, tablename, policyname;

select
  p.proname,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE')
    as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'get_client_portal_invoice_records',
    'submit_client_portal_quote_response',
    'get_client_portal_quote_responses',
    'send_client_portal_message',
    'reply_client_portal_message',
    'mark_client_portal_messages_read',
    'update_client_portal_profile'
  )
order by p.proname;

select
  count(*) as linked_clients,
  count(*) filter (where p.id is null) as broken_profile_links
from public.clients c
left join public.profiles p on p.id = c.profile_id
where c.profile_id is not null;

select id, name, public, file_size_limit
from storage.buckets
where id = 'mketics-documents';
