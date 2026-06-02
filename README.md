# MKETICS Website

Production-ready MKETICS website and business portal.

## Main Routes

- `/` - Home
- `/services` - Services
- `/solutions` - Solutions
- `/pricing` - Pricing
- `/digital-hub` - Digital Hub
- `/contact` - Contact
- `/quote` - Dedicated Quote Request page
- `/admin` - Admin Dashboard
- `/client-login` - Client Login
- `/client-portal` - Client Portal

## Build

```bash
npm install
npm run build
```

## Local Development

```bash
npm run dev -- --host 0.0.0.0
```

## Cloudflare Pages

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

## Current Business Flow

Client quote request → Admin review → Prepare project/invoice → Client portal → Invoice/download/support.

## Important

Keep the invoice PDF generator using the official MKETICS Standard Bank business account only.


## Pass 19: Supabase & Live Data Readiness

Added:
- `docs/SUPABASE_LIVE_DATA_READINESS.md`
- `supabase/MKETICS_LIVE_DATA_SETUP.sql`
- `PASS_19_CHECKLIST.md`

Use these files before final deployment to confirm tables, storage, environment variables, and live business workflow.
