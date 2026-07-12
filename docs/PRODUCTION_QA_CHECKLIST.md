# MKETICS Production QA and Launch Checklist

Website: https://mketics.co.za  
Project: MKETICS (PTY) LTD Website  
Status: Final production review

---

## 1. Core Page Review

Check every public page on desktop and mobile.

- [ ] Home page
- [ ] About page
- [ ] Services page
- [ ] Projects page
- [ ] Resources page
- [ ] Pricing page
- [ ] Contact page
- [ ] Legal & Compliance page
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] POPIA Notice
- [ ] Cookie Notice
- [ ] Payment Terms
- [ ] Refund Policy
- [ ] Disclaimer

Confirm:

- [ ] Page loads correctly
- [ ] No broken layout
- [ ] No text overlap
- [ ] No unnecessary clutter
- [ ] Mobile layout is readable
- [ ] Desktop spacing is clean
- [ ] Buttons are visible and clear
- [ ] Footer appears correctly

---

## 2. Brand and Content Check

Confirm MKETICS branding is consistent.

- [ ] Logo displays correctly
- [ ] Brand colours stay blue, cyan, navy, white and silver-inspired
- [ ] No gold styling
- [ ] Tagline is correct: Speak Innovation. Deliver Value.
- [ ] Company name appears correctly: MKETICS (PTY) LTD
- [ ] Registration number is correct: 2026/290708/07
- [ ] Enterprise number is correct: K2026290708
- [ ] No outdated B-BBEE wording where it should not appear
- [ ] No placeholder text
- [ ] No lorem ipsum
- [ ] No duplicated sections
- [ ] No unnecessary long paragraphs

---

## 3. Navigation Check

Test all header and footer links.

- [ ] Home
- [ ] About
- [ ] Services
- [ ] Projects
- [ ] Resources
- [ ] Pricing
- [ ] Contact
- [ ] Request a Quote
- [ ] WhatsApp MKETICS
- [ ] Legal links

Confirm:

- [ ] Active page state works
- [ ] Mobile menu opens
- [ ] Mobile menu closes
- [ ] Links go to the correct pages
- [ ] No 404 errors
- [ ] Browser back and forward works

---

## 4. Contact and Lead Flow

Test the contact page fully.

- [ ] Contact form loads
- [ ] Name field works
- [ ] Email field works
- [ ] Phone field works
- [ ] Service field works
- [ ] Budget field works
- [ ] Timeline field works
- [ ] Preferred contact method works
- [ ] Project details field works
- [ ] Submit button works
- [ ] Loading state appears
- [ ] Success message appears
- [ ] Error message appears when needed
- [ ] Required field validation works

Test contact actions:

- [ ] WhatsApp button opens WhatsApp
- [ ] Email Instead opens email client
- [ ] Request Quote button opens contact page
- [ ] Floating contact button opens
- [ ] Floating contact button closes
- [ ] Floating WhatsApp works
- [ ] Floating Request Quote works

---

## 5. Service Explorer Handoff

Test the Service Explorer to Contact flow.

- [ ] Complete Service Explorer
- [ ] Click Request Quote based on recommendation
- [ ] Contact page opens
- [ ] Recommended service appears
- [ ] Service pillar appears
- [ ] Readiness level appears
- [ ] Supporting services appear
- [ ] Selected answers appear
- [ ] WhatsApp message includes recommendation details
- [ ] Email message includes recommendation details
- [ ] Form submission includes recommendation details

---

## 6. Google Analytics Tracking

Confirm GA4 is working.

Check:

- [ ] Page views appear in Realtime
- [ ] Home page is tracked
- [ ] About page is tracked
- [ ] Services page is tracked
- [ ] Projects page is tracked
- [ ] Resources page is tracked
- [ ] Pricing page is tracked
- [ ] Contact page is tracked

Expected events:

- [ ] page_view
- [ ] quote_cta_click
- [ ] whatsapp_click
- [ ] email_click
- [ ] floating_contact_toggle
- [ ] generate_lead
- [ ] contact_form_validation_error
- [ ] contact_form_error

Main key event:

- [ ] generate_lead is marked as a key event in GA4

---

## 7. SEO Check

Check the public SEO basics.

- [ ] Each page has a proper title
- [ ] Each page has a meta description
- [ ] Homepage title includes MKETICS
- [ ] Pricing page title includes packages/pricing
- [ ] Contact page title includes quote/contact intent
- [ ] Open Graph image works
- [ ] Social preview is clean
- [ ] Sitemap is accessible
- [ ] Robots.txt is accessible
- [ ] Canonical URLs are correct

Test:

```text
https://mketics.co.za/sitemap.xml
https://mketics.co.za/robots.txt