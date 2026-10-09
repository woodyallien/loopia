# Loopia MVP

Loopia is a bilingual loyalty, customer acquisition, referral, and retention platform for restaurants, bars, and cafes. This repository contains a polished demo for the Cusco launch market, with an admin workspace, restricted staff flow, customer portal, public site, and a Supabase-ready tenant model.

## Architecture

- React 19, Vite, TypeScript, Tailwind CSS
- React Router for public, admin, staff, and customer routes
- Recharts for accessible visual reporting
- Mock-first data in `src/data/mock.ts`
- Central product branding in `src/config/brand.ts`
- Supabase boundary in `src/lib/supabase.ts`
- PostgreSQL schema, RLS, and seed data in `supabase/`

The app automatically uses demo mode if Supabase environment variables are absent. UI modules consume typed data rather than Supabase directly, allowing repository adapters to replace mock data without restructuring screens.

## Installation

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Demo login: `admin` / `admin`. Other role previews use `manager` / `admin` and `staff` / `admin`.

Useful routes:

- `/` public landing page
- `/login` business login
- `/join` simulated customer OTP registration (`123456`)
- `/portal` mobile customer portal
- `/app` business application

## Vercel Deployment

### Prerequisites

- Node.js `22.12+`
- npm `10+`
- A Vercel account connected to the repository

### Build Verification

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

### Vercel Import Settings

- Framework preset: `Vite`
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` rewrites application routes to `index.html`, so direct navigation and refresh work with React Router. Static files remain served by Vercel before the SPA fallback.

### Environment Variables

The first deployment is intentionally demo-first. Leave these variables unset, or set `VITE_APP_MODE=demo`, to use fictional mock data without Supabase credentials.

```dotenv
VITE_APP_MODE=demo
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

For a later connected deployment, set `VITE_APP_MODE=production` plus the Supabase URL and browser-safe publishable key. Never expose a service-role key, database password, JWT secret, or other private credential in a `VITE_` variable.

### Demo Behavior

Demo login is `admin` / `admin`; `manager` / `admin` and `staff` / `admin` preview restricted roles. Authentication is stored in `sessionStorage`, so it survives in-app navigation and refresh within the current browser tab, but not a new tab or browser restart. Demo scenarios, theme, language, feedback, and demo requests use browser `localStorage`.

The deployment intentionally displays the existing subtle `Modo demo` indicator. The demo deployment is marked `noindex, nofollow`; internal routes are never intended for indexing. A future production marketing deployment can enable indexing for the public landing route while keeping `/app` and `/portal` private from crawlers.

### Preview vs Production

- `main` -> Vercel Production deployment
- Feature branches and pull requests -> Vercel Preview deployments
- Use Preview URLs for stakeholder, mobile, accessibility, and route-refresh review before promoting to Production.
- Development uses local `.env.local`; Preview uses demo mode; Production may remain demo until the Supabase environment is proven.

### Optional Vercel CLI

```bash
npm install -g vercel
vercel
vercel --prod
```

Do not run `vercel --prod` until the deployment has been explicitly approved.

### Troubleshooting

- A refreshed nested route should resolve through the SPA rewrite in `vercel.json`.
- If the app connects unexpectedly, check `VITE_APP_MODE` and both Supabase variables in the active Vercel environment scope.
- If a deploy fails, reproduce with `npm run build` locally using Node `22.12+`.
- Do not add local machine URLs or private Supabase credentials to Vercel variables.

## Environment Variables

Copy `.env.example` to `.env.local` for a connected development environment:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_APP_MODE=production
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not expose a Supabase service role key in Vite.

## Supabase Setup

1. Create a Supabase project.
2. Install the Supabase CLI and run `supabase link --project-ref YOUR_REF`.
3. Apply migrations with `supabase db push`.
4. Seed a local instance with `supabase db reset`, or run `supabase/seed.sql` in a development project.
5. Create Auth users and matching `profiles` / `organization_members` records for production login.

The migration enables RLS on tenant-owned tables. Membership helper functions scope reads to the organization; updates and deletes require owner or manager membership. The public role can only insert demo requests.

## Development

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Demo submissions are stored in browser `localStorage`. Outbound campaigns, QR downloads, OTP delivery, AI suggestions, roulette outcomes, CSV exports, media uploads, and partner conversions are intentionally simulated.

See `docs/vercel-deployment-checklist.md`, `docs/architecture.md`, `docs/data-model.md`, and `docs/demo-guide.md` for implementation and demonstration detail.
