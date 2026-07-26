# Source inventory and consolidation decisions

The supplied folder contains 22 current SQL files. Additional `(1)` copies in
the working upload area are duplicates of the supplied `(2)` versions and are
not separate migrations.

| Source file | Final treatment |
| --- | --- |
| `schema.sql` | Existing core schema; preflight validates it |
| `storage-policies.sql` | Replaced by `07_storage_policies.sql` |
| `admin-settings-permissions.sql` | Consolidated into RLS-controlled grants |
| `admin-user-management-permissions.sql` | Existing admin profile policy retained |
| `ai-assistant-permissions.sql` | Consolidated into RLS-controlled grants |
| `ai-project-planner-permissions.sql` | Consolidated into RLS-controlled grants |
| `business-finance-permissions.sql` | Consolidated into RLS-controlled grants |
| `business-invoices-permissions.sql` | Consolidated into grants and invoice RPC |
| `business-reports-permissions.sql` | Consolidated into RLS-controlled grants |
| `executive-snapshot-permissions.sql` | Consolidated into RLS-controlled grants |
| `project-task-board-permissions.sql` | Consolidated into RLS-controlled grants |
| `project-time-reports-permissions.sql` | Consolidated into RLS-controlled grants |
| `client-auth-profile-bootstrap.sql` | Hardened in `08_auth_profile_bootstrap.sql` |
| `client-portal-permissions.sql` | Replaced by `02_client_portal_rls.sql` |
| `client-portal-profile-management.sql` | Hardened in `06_profile_management.sql` |
| `client-portal-invoices-permissions.sql` | Replaced by `03_invoice_rpc.sql` and storage rules |
| `invoice-receipts-permissions.sql` | Consolidated into `07_storage_policies.sql` |
| `client-portal-quote-acceptance-permissions.sql` | Replaced by normalized quote responses |
| `client-portal-response-inbox-permissions.sql` | Covered by quote-response table admin policy |
| `client-direct-messaging.sql` | Replaced by controlled messaging RPCs |
| `client-portal-announcements-permissions.sql` | Retained as a narrowly readable settings row |
| `client-portal-project-progress-permissions.sql` | Unsafe client writes removed |

## Intentional frontend changes

The old project-progress and approval implementation allowed any authenticated
portal user to update a shared JSON settings row. That cannot safely isolate
one client from another. It is intentionally not reproduced.

Before deploying that feature again, move project progress and approvals into
client/project-linked tables or controlled RPCs. Until then, the core project
record remains visible to its linked client, but shared JSON approval writes
are disabled.

The old quote response inbox and messaging implementations also used shared
JSON or direct table writes. The final pack replaces them with controlled RPCs;
the frontend must call those RPC names documented in `README.md`.

## Supabase SQL Editor

The eight saved queries visible in the supplied screenshot are historical,
diagnostic or combined copies already covered by this pack. They may be deleted
from the SQL Editor after the final pack is stored safely. Deleting saved SQL
text does not undo database changes previously executed.

