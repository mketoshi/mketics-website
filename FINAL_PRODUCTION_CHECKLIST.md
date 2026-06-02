# MKETICS Website Pass 18 - Final Production Readiness Checklist

## Current Production Version
Use this version as the latest production candidate after testing locally.

## Core Public Pages
Test these routes before deployment:

- /
- /services
- /solutions
- /pricing
- /digital-hub
- /contact
- /quote
- /client-login
- /client-portal
- /admin

## Must-Check Items

### 1. Mobile Navigation
- Open menu on phone.
- Confirm all items are readable.
- Confirm Quote, Catalogue and Client Login buttons work.
- Confirm no horizontal scrolling.

### 2. Quote Page
- Search services.
- Select service group.
- Select specific service.
- Submit a test quote request.
- Confirm request appears inside /admin.
- Confirm WhatsApp message opens correctly.

### 3. Admin Dashboard
- Login with approved admin email.
- Review quote request.
- Use Prepare Project.
- Use Prepare Invoice.
- Create project and invoice.
- Confirm Paid/Unpaid status only.

### 4. Client Portal
- Login as a client.
- Confirm project appears.
- Confirm invoice appears.
- Download invoice PDF.
- Confirm banking details are visible.
- Confirm catalogue download works.
- Confirm support ticket submission works.

### 5. Invoice PDF
- Account number must be visible.
- Payment reference must be clear.
- Status must show Paid or Unpaid.
- Only official Standard Bank details must appear.

### 6. Cloudflare Pages Settings
Recommended build settings:

Build command:
npm run build

Output directory:
dist

Node version:
20 or latest available stable Node version

### 7. Important Files
Do not delete:

- public/_redirects
- public/_headers
- public/docs/MKETICS_Service_Catalogue.pdf
- public/docs/MKETICS_Service_Catalogue.docx
- src/utils/generateInvoicePdf.js

## Final Notes
This pass focuses on production readiness, clean documentation, and ensuring the current working website version is packaged safely.
