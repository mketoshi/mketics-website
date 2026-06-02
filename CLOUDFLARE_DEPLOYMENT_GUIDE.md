# MKETICS Cloudflare Deployment Guide

This guide is for deploying the MKETICS website to Cloudflare Pages.

## 1. Local Test First

Run:

```bash
npm install
npm run build
npm run dev -- --host 0.0.0.0
```

Test:

- /
- /quote
- /admin
- /client-login
- /client-portal
- /docs/MKETICS_Service_Catalogue.pdf

## 2. Push to GitHub

Recommended flow:

```bash
git add .
git commit -m "MKETICS production deployment pass"
git push
```

## 3. Cloudflare Pages Build Settings

Use:

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 20
```

## 4. Environment Variables

In Cloudflare Pages:

Project → Settings → Environment variables

Add:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use the same values from your local `.env.local`.

## 5. Direct Route Support

This project includes:

```txt
public/_redirects
```

This allows direct routes to work:

- /quote
- /admin
- /client-login
- /client-portal
- /services
- /solutions

## 6. Security Headers

This project includes:

```txt
public/_headers
```

It adds basic security and caching rules.

## 7. Important Live Checks

After deployment, test:

```txt
https://mketics.co.za/
https://mketics.co.za/quote
https://mketics.co.za/admin
https://mketics.co.za/client-login
https://mketics.co.za/client-portal
https://mketics.co.za/docs/MKETICS_Service_Catalogue.pdf
```

## 8. Business Flow Test

1. Submit a quote at `/quote`.
2. Open `/admin`.
3. Confirm the quote appears.
4. Prepare project.
5. Prepare invoice.
6. Login as client.
7. Confirm project and invoice appear.
8. Download invoice PDF.
9. Confirm account number and reference are visible.

## 9. Final Production Version

Use this pass as the Cloudflare deployment candidate.
