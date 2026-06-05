# Monad Tour Colombia - Landing Page

## Stack

- Next.js 16 (App Router + Turbopack)
- TypeScript 5 (strict)
- Tailwind CSS v4 (PostCSS, not config file)
- Prisma ORM with PostgreSQL
- Framer Motion for animations
- Resend for transactional email

## Architecture

Single landing page (`/`) with additional routes for forms, legal pages, team showcase, and admin.

Most UI components use `"use client"` because of Framer Motion. Server components are limited to form primitives (`src/components/forms/*`), `Footer`, `EventSchema`, and page metadata.

Content is hardcoded in Spanish. No i18n.

## Key Patterns

- **Admin auth:** Google Sign-In only. HTTP-only cookie with an HMAC-SHA256 signed payload (email + expiry). See `src/lib/admin-auth.ts`. Uses `crypto.timingSafeEqual` for signature verification.
- **Rate limiting:** In-memory fixed-window counter per IP, 5 hits / 60s (`src/lib/rate-limit.ts`).
- **Form validation:** Zod schemas in `src/lib/validations/applications.ts`, used with React Hook Form.
- **Email:** Fire-and-forget Resend HTTPS notifications on application submit, plus approval/rejection emails from the admin dashboard (`src/lib/email.ts`).
- **Database:** Prisma singleton in `src/lib/db.ts`.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - HMAC secret used to sign admin session cookies. Generate with `openssl rand -hex 32`.
- `RESEND_API_KEY` - Resend API key for transactional email
- `RESEND_FROM` - Optional sender address (defaults to `onboarding@resend.dev`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID (public, used both client-side for the GIS button and server-side for ID token verification)
- `ADMIN_ALLOWED_EMAILS` - Comma-separated allowlist of emails authorized to log in via Google (read access)
- `ADMIN_FULL_ACCESS_EMAILS` - Subset of `ADMIN_ALLOWED_EMAILS` with write permissions (approve/reject/withdraw/reactivate/resend). Emails not listed here can only view applications.

## Admin Login

Only Google Sign-In (`POST /api/admin/google-login`). The Google Identity Services button on `/admin` posts the ID token to the server; the server verifies it with `google-auth-library`, checks `email_verified`, and matches the email against `ADMIN_ALLOWED_EMAILS`. On success it sets the `admin_session` cookie (HMAC-signed `email + exp` payload) via `setAdminCookie(email)` in `src/lib/admin-auth.ts`.

The Google project is in Testing mode, so the OAuth consent screen test-users list must include any email in `ADMIN_ALLOWED_EMAILS` (Google blocks non-test-users before the token reaches us).

## Notes

- When unsure about a Next.js API, check `node_modules/next/dist/docs/` for reference - read only the specific file you need.
- Cities data lives in `src/lib/constants.ts` (Medellin and Bogota only).
- Partner logos are in `public/images/partners/` organized by category (sponsors, universities, communities).
- Organizers list is hardcoded in `src/lib/organizers.ts` (profile images under `public/images/organizers/`).
