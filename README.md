# Monad Tour Colombia 2026

```text
 __  __                       _   _____
|  \/  | ___  _ __   __ _  __| | |_   _|___  _   _ _ __
| |\/| |/ _ \| '_ \ / _` |/ _` |   | | / _ \| | | | '__|
| |  | | (_) | | | | (_| | (_| |   | || (_) | |_| | |
|_|  |_|\___/|_| |_|\__,_|\__,_|   |_| \___/ \__,_|_|
  ____      _                 _     _
 / ___|___ | | ___  _ __ ___ | |__ (_) __ _
| |   / _ \| |/ _ \| '_ ` _ \| '_ \| |/ _` |
| |__| (_) | | (_) | | | | | | |_) | | (_| |
 \____\___/|_|\___/|_| |_| |_|_.__/|_|\__,_|
```

Landing page for Monad Tour Colombia - MonadBlitz one-day hackathons in Medellin and Bogota.

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

## Events

| City     | Date         | Registration                                   |
| -------- | ------------ | ---------------------------------------------- |
| Medellin | June 6, 2026 | [luma.com/o56ekpyb](https://luma.com/o56ekpyb) |
| Bogota   | TBA          | [luma.com/gytabj8l](https://luma.com/gytabj8l) |

## Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Database:** PostgreSQL via Prisma ORM
- **Email:** Nodemailer (Gmail SMTP)
- **Forms:** React Hook Form + Zod validation
- **Maps:** React Leaflet
- **Deployment:** Railway

## Setup

### Requirements

- Node.js 20+
- PostgreSQL database

### Install

```bash
npm install
```

### Environment

Copy `.env.local.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
ADMIN_PASSWORD=your-admin-password
GMAIL_APP_PASSWORD=your-gmail-app-password
```

- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Password for the `/admin` dashboard
- `GMAIL_APP_PASSWORD` - Gmail app-specific password for email notifications on new applications

### Database

```bash
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations (development)
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Development

```bash
npm run dev          # Start dev server (Turbopack)
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build (generates Prisma + Next.js)
npm start            # Production server
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check
npm run format       # Prettier format
npm test             # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npm run build:check  # lint + type-check + build
```

## Project Structure

```
src/
  app/
    page.tsx                        # Landing page (all sections)
    layout.tsx                      # Root layout, metadata, fonts
    globals.css                     # Tailwind + custom styles
    sitemap.ts                      # Dynamic sitemap
    opengraph-image.tsx             # OG image generator
    twitter-image.tsx               # Twitter card generator
    apply/
      mentor/page.tsx               # Mentor application form
      judge/page.tsx                # Judge application form
    equipo/page.tsx                 # Team showcase (approved mentors/judges)
    privacidad/page.tsx             # Privacy policy (Ley 1581)
    terminos/page.tsx               # Terms and conditions
    admin/
      layout.tsx                    # Admin auth wrapper
      applications/page.tsx         # Applications dashboard
    api/
      applications/route.ts         # POST - submit application (rate-limited)
      team/route.ts                 # GET - public approved members
      admin/
        login/route.ts              # POST - admin login
        logout/route.ts             # POST - admin logout
        verify/route.ts             # GET - check session
        applications/route.ts       # GET - list applications
        applications/[id]/route.ts  # PATCH - update status
  components/
    Navbar.tsx                      # Navigation + Build mega menu
    Hero.tsx                        # Hero with map + CTAs
    MapColombia.tsx                 # Interactive Leaflet map
    Countdown.tsx                   # Event countdown timer
    Stats.tsx                       # Monad network stats
    EventsTable.tsx                 # Events list with registration
    Schedule.tsx                    # Event day schedule
    BuildFeatures.tsx               # Feature cards with parallax
    ExploreCards.tsx                # Learning path cards
    Gallery.tsx                     # Event photo gallery
    Highlights.tsx                  # Embedded tweets
    Marquee.tsx                     # Partner logo marquee
    FAQ.tsx                         # FAQ accordion
    Footer.tsx                      # Footer navigation
    ScrollNav.tsx                   # Floating scroll navigation
    CookieConsent.tsx               # Cookie consent banner
    EventSchema.tsx                 # JSON-LD structured data
    BuildMegaMenu.tsx               # Mega menu dropdown
    ConcentricCircles.tsx           # SVG decoration
    ScrambleLink.tsx                # Text scramble effect
    forms/
      FormField.tsx                 # Input wrapper
      FormSelect.tsx                # Select wrapper
      FormTextarea.tsx              # Textarea with counter
      FormCheckbox.tsx              # Checkbox wrapper
  lib/
    constants.ts                    # Cities, partners, FAQs, links
    types.ts                        # TypeScript interfaces
    db.ts                           # Prisma client singleton
    email.ts                        # Email notification sender
    admin-auth.ts                   # Cookie-based admin auth (HMAC)
    rate-limit.ts                   # In-memory rate limiter
    validations/
      applications.ts              # Zod schemas for forms
    buildMenuData.ts               # Mega menu data
  hooks/
    useTextScramble.ts             # Scramble animation hook
prisma/
  schema.prisma                    # Database schema
public/
  images/
    gallery/                       # Event photos
    partners/
      sponsors/                    # Sponsor logos
      universities/                # University partner logos
      communities/                 # Community partner logos
```

## Pages

| Route           | Access  | Description                       |
| --------------- | ------- | --------------------------------- |
| `/`             | Public  | Landing page with all sections    |
| `/apply/mentor` | Public  | Mentor application form           |
| `/apply/judge`  | Public  | Judge application form            |
| `/equipo`       | Public  | Approved mentors and judges       |
| `/privacidad`   | Public  | Privacy policy (Ley 1581 de 2012) |
| `/terminos`     | Public  | Terms and conditions              |
| `/admin`        | Private | Applications dashboard (password) |

## API

| Method | Endpoint                      | Auth  | Description                |
| ------ | ----------------------------- | ----- | -------------------------- |
| POST   | `/api/applications`           | None  | Submit application (5/min) |
| GET    | `/api/team`                   | None  | List approved team members |
| POST   | `/api/admin/login`            | None  | Admin login                |
| POST   | `/api/admin/logout`           | Admin | Admin logout               |
| GET    | `/api/admin/verify`           | Admin | Check session              |
| GET    | `/api/admin/applications`     | Admin | List all applications      |
| PATCH  | `/api/admin/applications/:id` | Admin | Update application status  |

## Security

- Admin auth uses HTTP-only, secure, SameSite=strict cookies with HMAC-SHA256 tokens
- Application submissions are rate-limited (5 requests per minute per IP)
- Status updates validate `approved`/`rejected` values
- Environment secrets stored in `.env.local` (not committed)

## Deployment

Deployed on Railway with PostgreSQL.

```bash
npm run build    # Runs prisma generate + next build
npm start        # Starts production server
```

Required environment variables must be set in the hosting platform.

## Partners

- Monad Foundation
- DevLabX3
- UPB, EAFIT, UdeA, ITM, TDEA, CESDE (university venues)
- Platohedro, Criptoprofesor, Ultravioleta DAO (communities)
