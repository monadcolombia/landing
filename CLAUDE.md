# Monad Tour Colombia - Landing Page

## Stack

- Next.js 16 (App Router + Turbopack)
- TypeScript 5 (strict)
- Tailwind CSS v4 (PostCSS, not config file)
- Prisma ORM with PostgreSQL
- Framer Motion for animations

## Architecture

Single landing page (`/`) with additional routes for forms, legal pages, team showcase, and admin.

All UI components use `"use client"` due to Framer Motion. This is intentional.

Content is hardcoded in Spanish. No i18n.

## Key Patterns

- **Admin auth:** HTTP-only cookies with HMAC-SHA256 tokens (`src/lib/admin-auth.ts`)
- **Rate limiting:** In-memory token bucket per IP (`src/lib/rate-limit.ts`)
- **Form validation:** Zod schemas in `src/lib/validations/applications.ts`, used with React Hook Form
- **Email:** Fire-and-forget Nodemailer notifications on application submit (`src/lib/email.ts`)
- **Database:** Prisma singleton in `src/lib/db.ts`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection
- `ADMIN_PASSWORD` - Admin dashboard password (kept as fallback alongside Google login)
- `GMAIL_APP_PASSWORD` - Gmail app password for notifications
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID (public, used both client-side for the GIS button and server-side for ID token verification)
- `ADMIN_ALLOWED_EMAILS` - Comma-separated allowlist of emails authorized to log in via Google

## Admin Login

Two methods, both end up setting the same `admin_session` HMAC cookie via `src/lib/admin-auth.ts`:

- **Google Sign-In** (`POST /api/admin/google-login`): Google Identity Services button on the login page. Server verifies the ID token with `google-auth-library`, checks `email_verified`, and matches against `ADMIN_ALLOWED_EMAILS`.
- **Password fallback** (`POST /api/admin/login`): the original `ADMIN_PASSWORD` flow, kept as backup.

The Google project is in Testing mode, so the OAuth consent screen test-users list must include any email in `ADMIN_ALLOWED_EMAILS` (Google blocks non-test-users before the token reaches us).

## Notes

- When unsure about a Next.js API, check `node_modules/next/dist/docs/` for reference - read only the specific file you need.
- Cities data lives in `src/lib/constants.ts` (Medellin and Bogota only).
- Partner logos are in `public/images/partners/` organized by category (sponsors, universities, communities).
