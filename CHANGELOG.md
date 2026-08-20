# CHANGELOG

## 2026-08-20 — System-Wide Login, Sign Up, and Sign Out Improvements

### Added
* Reusable `<SignOutButton />` client component with pending spinner state and variant styles (`components/sign-out-button.tsx`).
* `signOutAction` Server Action in `app/login/actions.ts` utilizing NextAuth v5 session invalidation and automatic redirection to `/login`.
* Standalone `/logout` and `/signout` GET/POST route handlers (`app/logout/route.ts`, `app/signout/route.ts`) for browser direct navigation and link targets.
* Interactive password show/hide toggles with accessibility aria-labels on login and signup forms.
* Real-time client-side input validations (email format, 6+ character password minimum, password matching confirmation) in `app/login/auth-form.tsx`.
* "Account & Security" section in Settings page (`app/(dashboard)/settings/page.tsx`) displaying current session role and Sign Out button.
* Sign Out actions in Sidebar footer (`components/sidebar.tsx`) and TopBar header (`components/top-bar.tsx`).
* Comprehensive test suite `__tests__/auth-actions.test.ts` verifying loginAction, registerAction, signOutAction, validation rules, and error handling.

### Changed
* Expanded Next.js 16 route proxy matchers in `proxy.ts` to protect all dashboard routes (`/dashboard`, `/overview`, `/inbox`, `/campaigns`, `/automations`, `/logs`, `/settings`, `/diagnostics`).
* Updated public site header and landing page CTAs ("Start free", "Get started") to link directly to `/login?mode=signup`.
* Updated invitation acceptance card (`components/invitation-accept-card.tsx`) to preserve `callbackUrl` upon redirecting unauthenticated users to `/login`.

### Fixed
* Fixed unprotected dashboard subpaths (`/campaigns`, `/overview`, `/inbox`, `/diagnostics`) at the proxy layer.
* Fixed missing Sign Out options across desktop and mobile dashboard layouts.
* Fixed missing password visibility toggles and real-time confirmation validation on authentication forms.

### Impacted Modules
* Authentication & Server Actions (`app/login/actions.ts`, `app/login/auth-form.tsx`, `app/logout/route.ts`, `app/signout/route.ts`)
* Route Proxy / Middleware (`proxy.ts`)
* Dashboard Layout & Navigation (`components/sidebar.tsx`, `components/top-bar.tsx`, `components/sign-out-button.tsx`)
* Settings & Account Management (`app/(dashboard)/settings/page.tsx`)
* Public Landing Page & Invitations (`components/public-site-header.tsx`, `app/page.tsx`, `components/invitation-accept-card.tsx`)

### Notes
* All 16 test suites and 154 unit tests passing cleanly (`npm test`).
* TypeScript verification passed with 0 errors (`npm run typecheck`).

---

## 2026-08-20 — Initial Environment & Auth Migration

### Added
* Initial project setup and environment configuration.
* Generated secure random secrets for `NEXTAUTH_SECRET`, `CRON_SECRET`, `ENCRYPTION_KEY` (32-byte hex), and `WEBHOOK_VERIFY_TOKEN`.
* Generated Prisma Client in `app/generated/prisma`.
* Applied PostgreSQL migrations via `prisma migrate deploy`.
* Added direct Email + Password credentials authentication with `bcryptjs` password hashing and Auth.js (NextAuth v5) Credentials provider.
* Added `app/api/auth/register` route enforcing unique emails, password validation, and auto-provisioning workspace upon registration.
* Added interactive dual-mode `AuthForm` client component on `/login` supporting Sign In and Create Account.
* Added unit test suite `__tests__/auth-passwords.test.ts`.

### Changed
* Initialized `.env` configuration file from `.env.example` with cryptographically secure defaults and user database credentials.
* Updated `package.json` `vercel-build` script to decouple `prisma migrate deploy` from static build compilation on Vercel.
* Replaced Resend/Nodemailer magic link login flow with direct Email + Password authentication.
* Updated `prisma/schema.prisma` with `passwordHash` field on `model User` (migration `20260820150000_add_user_password_hash`).
* Updated landing page, invitation components, and documentation to reflect Email & Password authentication without Resend.

### Fixed
* Resolved Vercel deployment build step failure by ensuring static build compilation runs `prisma generate && next build`.
* Removed third-party paid domain requirement by eliminating email delivery dependency for sign-in.

### Impacted Modules
* Authentication & Session Management (`lib/auth.ts`, `lib/auth-passwords.ts`, `app/api/auth/register`)
* User Interface & Login (`app/login/page.tsx`, `app/login/auth-form.tsx`, `app/verify-request/page.tsx`)
* Database Schema & Migrations (`prisma/schema.prisma`, `prisma/migrations/20260820150000_add_user_password_hash`)
* Environment Configuration & Documentation (`.env.example`, `SECURITY.md`, `docs/stack.md`)

### Notes
* All 15 test suites and 144 unit tests passing cleanly (`npm test`).
* TypeScript verification passed with 0 errors (`npm run typecheck`).
* Production build verified (`npm run vercel-build`).
