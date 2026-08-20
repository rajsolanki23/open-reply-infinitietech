# CHANGELOG

## 2026-08-20

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
