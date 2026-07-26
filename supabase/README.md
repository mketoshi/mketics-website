# MKETICS Supabase secure upgrade pack

Prepared: 26 July 2026

This pack upgrades the existing MKETICS Supabase database. It does not recreate
or delete the core tables and does not contain account-specific email addresses.

## Before running

1. Create a Supabase database backup.
2. Test in a staging project first.
3. Keep the frontend deployment unchanged until all verification checks pass.
4. Run each file separately in the SQL Editor, in the order below.

## Exact execution order

1. `00_preflight.sql`
2. `01_security_foundation.sql`
3. `02_client_portal_rls.sql`
4. `03_invoice_rpc.sql`
5. `04_quote_responses.sql`
6. `05_client_messaging.sql`
7. `06_profile_management.sql`
8. `07_storage_policies.sql`
9. `08_auth_profile_bootstrap.sql`
10. `90_verification.sql`

Do not run the next file if the current file reports an error.

## Frontend RPC contract

| Feature | RPC/table | Important values |
| --- | --- | --- |
| Invoice list | `get_client_portal_invoice_records()` | Returns invoice rows |
| Submit quote response | `submit_client_portal_quote_response(uuid,text,text,boolean)` | `accepted`, `rejected`, `changes_requested` |
| Quote response history | `get_client_portal_quote_responses()` | Returns response rows |
| Send message | `send_client_portal_message(uuid,text,text)` | Null conversation starts a thread |
| Admin reply | `reply_client_portal_message(uuid,text)` | Admin/staff only |
| Mark messages read | `mark_client_portal_messages_read(uuid)` | Conversation UUID |
| Profile update | `update_client_portal_profile(text,text,text)` | Name, phone, organisation |

The original permission-only files for admin settings, AI tools, finance,
invoices, reports, task boards and time reports are consolidated into
`01_security_foundation.sql`. Authenticated users receive the SQL privileges
needed by PostgREST, while RLS remains the authorization boundary.

The frontend must not write directly to `settings`, update quote status directly,
or insert/update `client_messages` directly. Use the RPCs.

## Rollback

`99_rollback_feature_layer.sql` removes only the new portal feature functions,
message table and new policies. It does not remove core business tables or data
stored in `settings`. Take a backup before using it.

## Client account link

After the migrations, link a portal account by setting
`clients.profile_id = auth.users.id`. Do this through a separate, reviewed
account-administration query; do not hard-code personal emails into migrations.
