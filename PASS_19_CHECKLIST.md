# MKETICS Pass 19 Checklist

## Before Deploying Live

1. Confirm `.env.local` works locally.
2. Confirm Cloudflare Pages has:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. Confirm Supabase tables exist.
4. Confirm Storage bucket exists:
   - mketics-files
5. Submit a test quote from `/quote`.
6. Confirm quote appears in `/admin`.
7. Prepare project from the quote request.
8. Prepare invoice from the quote request.
9. Login as client and confirm:
   - project appears
   - invoice appears
   - invoice PDF downloads
10. Confirm invoice banking details are visible and correct.
