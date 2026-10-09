# Vercel Deployment Checklist

## Pre-deploy

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] No secrets, service-role keys, database passwords, or private tokens are committed
- [ ] `.env.example` contains names only, not credentials
- [ ] Demo mode works with Supabase variables absent
- [ ] Direct navigation and refresh work for public, auth, app, portal, and nested customer routes
- [ ] Responsive review completed at 390px, 768px, and 1440px
- [ ] Keyboard, focus, modal, drawer, form, theme, language, and command palette checks completed

## Vercel

- [ ] Repository connected
- [ ] Framework preset is `Vite`
- [ ] Root directory is the repository root
- [ ] Install command is `npm install`
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] Preview environment uses `VITE_APP_MODE=demo` or leaves Supabase variables unset
- [ ] Preview deployment created from the review branch or pull request

## Post-deploy

- [ ] `/` loads
- [ ] `/login` loads
- [ ] Demo account `admin` / `admin` reaches `/app`
- [ ] Authenticated refresh remains usable in the same browser tab
- [ ] Deep route refresh works, including `/app/customers/:id`
- [ ] Mobile layout reviewed
- [ ] WhatsApp CTA opens `https://wa.me/51944433008` in a new tab
- [ ] Customer portal loads
- [ ] Dark mode works
- [ ] ES/EN toggle works
- [ ] No unexpected browser console errors
- [ ] Unknown route shows the branded 404 screen

## Environment Separation

- Development: local `.env.local`; demo mode is recommended until Supabase is needed.
- Preview: Vercel Preview scope; demo mode for stakeholder review.
- Production: Vercel Production scope; remain in demo mode initially or switch to `production` only after Supabase Auth, RLS, and data paths are validated.

## Promotion Sequence

1. Push the branch and inspect the Vercel Preview deployment.
2. Complete this checklist against the Preview URL.
3. Collect stakeholder feedback and fix issues on the branch.
4. Merge to `main` only after approval.
5. Promote or redeploy Production with the intended environment scope.
