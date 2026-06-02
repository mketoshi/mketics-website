# MKETICS Supabase & Live Data Readiness

This pass prepares the project for reliable live use with Supabase.

## Main Live Workflow

1. Client submits a quote request at `/quote`.
2. Quote request is stored in `leads`.
3. Admin opens `/admin`.
4. Admin reviews quote request.
5. Admin prepares project/invoice from lead.
6. Client logs into `/client-portal`.
7. Client sees projects, invoices, support tickets and files.

## Required Environment Variables

Create `.env.local` locally and set these values:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not upload `.env.local` to GitHub.

In Cloudflare Pages, add the same variables under:

Project → Settings → Environment variables

## Important Tables

The website expects these tables:

- `leads`
- `projects`
- `invoices`
- `profiles`
- `support_tickets`
- `project_updates`
- `project_files`
- `support_files`
- `admin_notifications`

## Storage Bucket

Create this Supabase Storage bucket:

```txt
mketics-files
```

Use it for client project files and support attachments.

## Admin Access

The admin route is protected by approved admin email addresses in the frontend code.

Current approved emails include:

- smsane0505@gmail.com
- msanesphesihle968@gmail.com
- admin@mketics.co.za
- info@mketics.co.za

## Invoice Rule

Invoices must use only:

- Paid
- Unpaid

Do not reintroduce Pending, Overdue or Cancelled for invoice status unless the business process changes.

## Official Invoice Bank Details

Use only the official MKETICS business account:

- Bank: Standard Bank
- Account holder: MKETICS (PTY) LTD
- Account type: Current Account
- Account number: 10274150083
- Branch: BALLITO
- Branch code: 051001
- SWIFT: SBZA ZA JJ
