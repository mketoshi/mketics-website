# MKETICS Deployment Checklist

## Current production version
MKETICS Website Pass 11 — Deployment & Final Production Cleanup.

## Cloudflare Pages settings
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: project root

## Before deploying
1. Run `npm install`
2. Run `npm run build`
3. Run `npm run dev -- --host 0.0.0.0`
4. Test these pages:
   - `/`
   - `/services`
   - `/solutions`
   - `/pricing`
   - `/mketics-digital-hub`
   - `/contact`
   - `/client-login`
   - `/client-portal`
   - `/admin`
5. Generate a test invoice and confirm:
   - Status is only Paid or Unpaid
   - Standard Bank details are visible
   - Account number and payment reference are clear

## Important production notes
- Do not upload `.env` files to GitHub.
- Keep official MKETICS banking details only on invoices.
- The `_redirects` file is included so direct routes like `/admin` and `/client-login` load correctly on Cloudflare Pages.
- The `_headers` file adds basic security headers and long-term asset caching.

## Official invoice banking details
- Account holder: MKETICS (PTY) LTD
- Bank: Standard Bank
- Account type: Current
- Account number: 10274150083
- Branch: BALLITO
- Branch code: 051001
- SWIFT code: SBZA ZA JJ
