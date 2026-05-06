# Training Console

Mobile-first personal workout app for hypertrophy-focused gym training at Planet Fitness.

## What is implemented

- Next.js App Router structure with TypeScript and Tailwind.
- PWA manifest, icon, and production service worker registration.
- Single-user Auth.js foundation with Google OAuth and `AUTHORIZED_EMAILS`.
- Drizzle schema for Neon Postgres via Vercel Marketplace.
- Seeded exercise library with target muscles, equipment, movement patterns, cues, alternatives, and pain-aware substitution tags.
- Starter 3-day full-body program with a core component each day.
- Rules for double progression, weekly muscle volume, recovery status, substitutions, and insight generation.
- Mobile screens for Home, Workout, Library, Progress, and Setup.
- Vitest unit tests for the training rules and seed-data quality.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   ```bash
   DATABASE_URL=
   AUTH_SECRET=
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   AUTHORIZED_EMAILS=
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

4. Validate:

   ```bash
   npm test
   npm run build
   ```

## Notes

The app currently uses seeded demo data in `lib/training/data.ts` so the UI and logic work before Neon is connected. The Drizzle schema in `lib/db/schema.ts` is ready for the persistent version.
