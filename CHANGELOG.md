# CHANGELOG

## 2026-08-22 — Security Hardening, Access Control & Authorization Hardening Release

### Added
* Centralized timing-safe cron verification utility (`lib/cron-auth.ts`) utilizing `crypto.timingSafeEqual` with unit test suite (`__tests__/cron-auth.test.ts`).
* Timing-safe webhook verification challenge helper (`verifyWebhookChallenge` in `lib/meta/webhook.ts`).
* Auth rate limiting utility (`checkAuthRateLimit` in `lib/utils/rate-limiter.ts`) safeguarding login and password update actions against automated brute-force attacks.
* Comprehensive HTTP Security Headers in `next.config.ts` (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security`, and `Content-Security-Policy`).

### Changed
* **Account Takeover Prevention**: Hardened `app/api/admin/users/create/route.ts` to never overwrite password hashes or credentials when adding existing platform users to a workspace.
* **Role-Based Access Control (RBAC)**: Enforced `canManageWorkspace` (Owner/Admin check) across all admin routes (`/api/admin/users/create`, `/api/admin/worker`, `/api/admin/diagnostics`).
* **Cron Authentication**: Hardened all cron route handlers (`/api/cron/worker-sync`, `/api/cron/attach-next-reel`, `/api/cron/refresh-tokens`, `/api/cron/snapshot-followers`) to enforce mandatory secret verification via timing-safe comparison.
* **Registration Policy**: Aligned `/api/auth/register` with platform access policies by disabling public signups and requiring workspace admin provisioning.
* **Redirect Protocol Validation**: Hardened `/r/[slug]` link redirection to validate `http:` and `https:` schemes before redirecting.
* **Multi-Tenant Privacy**: Restricted `/api/admin/diagnostics` operational events queries strictly to the caller's `workspaceId`.
* **Salt Hardening**: Removed hardcoded fallback salt in `lib/tracking/server.ts`, requiring secret-derived salt in production.

### Impacted Modules
* Admin APIs (`app/api/admin/users/create/route.ts`, `app/api/admin/worker/route.ts`, `app/api/admin/diagnostics/route.ts`)
* Cron & Background Jobs (`lib/cron-auth.ts`, `app/api/cron/*`)
* Authentication & Access Control (`app/api/auth/register/route.ts`, `app/login/actions.ts`, `app/api/user/change-password/route.ts`, `lib/utils/rate-limiter.ts`)
* Meta Webhooks & Integration (`lib/meta/webhook.ts`, `app/api/webhook/route.ts`)
* Link Tracking & Diagnostics (`app/r/[slug]/route.ts`, `lib/tracking/server.ts`)
* Configuration (`next.config.ts`)

### Notes
* All 19 test suites and 174 unit tests passing cleanly (`npm test`).
* TypeScript verification passed with 0 errors (`npm run typecheck`).
* Production build verified cleanly with 0 errors (`npm run build`).

---

## 2026-08-22 — Public Marketing, Header, Templates & Agencies UI Modernization

### Added
* Refined public site header active tab state tracking for `home`, `features`, `templates`, and `agencies`.
* Interactive, modern light card visualization (`components/template-visual.tsx`) featuring comment trigger badge, category pills, monospace keyword tags, and simulated private DM reply bubble.
* Numbered setup playbook and metrics summary sidebar for template detail pages (`app/templates/[slug]/page.tsx`).
* Modern Campaign OS checklist card with emerald checkmarks and warm gradient CTA banner for SEO/Agencies landing page shell (`components/seo-page-shell.tsx`).
* Password reset feature (`resetPasswordAction` in `app/login/actions.ts` & `app/login/auth-form.tsx`) requiring matching email + existing password before setting new password, with warning for incorrect existing password.
* Authenticated password change API endpoint (`/api/user/change-password`) and inline form in Dashboard Settings Account & Security card.
* Vercel-compatible Web-Controlled Worker Engine (`lib/ops/worker-health.ts`, `lib/queue/dm-worker.ts`, `app/api/webhook/route.ts`) enabling direct in-process DM sending on Vercel and persistent worker state.
* Dedicated **Background Worker Engine Card** on System Status (`app/(dashboard)/diagnostics/page.tsx`) with one-click "Turn on worker", "Turn off worker", and "Sync queue now" buttons.
* Worker Control API (`/api/admin/worker`) and Vercel Cron sync endpoint (`/api/cron/worker-sync`).
* Authenticated User Account Provisioning API (`/api/admin/users/create`) enabling workspace administrators to create new team accounts with Full Name, Email, Initial Password, and Workspace Role.
* Interactive Post-Filter Loading Indicators and Shimmer Skeletons on Insights Dashboard (`app/(dashboard)/overview/page.tsx`, `components/ui-refined/stat-card.tsx`). Changing post limits (25, 50, 100, All) displays immediate filter spinners, StatCard shimmer states, FollowerChart transition, and animated table rows.
* Comprehensive unit test suite for admin user provisioning in `__tests__/admin-users.test.ts` (167 total tests passing).

### Changed
* Added dedicated **"View"** and **"Edit"** action buttons to each automation card on the Automations page (`app/(dashboard)/campaigns/page.tsx`), enabling immediate 1-click navigation to the automation details (`/campaigns/[id]`) and campaign builder editor (`/campaigns/[id]/edit`).
* Migrated production base URL resolution across `lib/tracking/message.ts`, `lib/workspace-invitations.ts`, and `lib/reports/share.ts` to utilize `getBaseUrl()` from `lib/env.ts`, replacing hardcoded localhost fallbacks with dynamic domain resolution supporting `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`, and custom production domains.
* Configured Vercel serverless background DM queue sync in `vercel.json` (`/api/cron/worker-sync` every minute), ensuring reliable automated DM dispatching on Vercel without requiring a standalone process.
* Restricted public `/login` authentication exclusively to **Sign In** and **Reset Password**, removing public self-registration from the application.
* Disabled open registration in `app/login/actions.ts` (`registerAction`) to safeguard company tools from unauthorized public access.
* Updated public site header and landing page hero/footer CTAs to link to `/login` with "Sign in to OpenReply" labels.
* Enhanced `TopHeader` (`components/ui-refined/top-header.tsx`) with an **Instagram Gradient Logo** badge and live online pulse dot next to the connected account handle (e.g. `@infinitietech`), clearly indicating the linked Instagram profile.
* Enhanced `TopHeader` dynamic route title resolution (`getPageInfo`) to cleanly format automation details, edit screens, and breadcrumbs, eliminating raw CUID / database IDs from the global top navbar header.
* 100% Pixel-Accurate Native Instagram DM & Button Preview (`components/campaign-preview.tsx`): Built an exact replica of live Instagram iOS direct messages featuring soft-grey (`#f0f2f5`) incoming bubbles, white embedded button cards with bold black text (`bg-white rounded-xl`), signature violet-purple (`#6b35ff`) outgoing user response bubbles, full multi-line text wrapping without truncation for long messages/buttons, comment trigger context banners, WhatsApp link formatting, and native light-mode composer.
* Added smooth mouse wheel, trackpad, and touch scrolling with custom dark scrollbars (`.preview-scrollbar`) inside the mobile phone preview screens (`components/campaign-preview.tsx`, `app/globals.css`), enabling seamless inspection of long DM threads, comments, and posts.
* Removed empty/contentless `Pricing` and `Security` links from `components/public-site-header.tsx`, focusing header navigation on `Features`, `Templates`, and `Agencies`.
* Updated `GradientButton` large variant to `rounded-2xl` and font weights for cohesive visual balance alongside secondary buttons on landing page heroes.
* Fixed button inner flex alignment and added `whitespace-nowrap` in `GradientButton` and marketing links so text and trailing arrows always remain on a single horizontal line without wrapping.
* Fixed `renderIcon` in `GradientButton` to use `React.isValidElement()` and properly instantiate React `forwardRef` components (e.g., Lucide icon components), resolving `Objects are not valid as a React child (found: object with keys {$$typeof, render})` on Settings and other pages.
* Resolved Next.js React Server Component (RSC) function prop serialization error by passing JSX icon elements within `children` across the server-client boundary.
* Completely converted `/templates` directory page from legacy dark `zinc-950`/cyan theme to the standard OpenReply light SaaS design system (`#fafafa` canvas, ambient orange glow mesh, white cards, and warm orange gradient accents).
* Completely converted `/templates/[slug]` playbook pages to the standard light SaaS design system with breadcrumbs, clean metrics, and playbook step cards.
* Completely converted `components/seo-page-shell.tsx` (used by `/instagram-dm-automation-agencies`, `/manychat-alternative`, etc.) to the standard light design system with a clean comparison table and FAQ sections.

### Fixed
* Restored missing **Your Follow-up message** UI controls in the Campaign Builder (`components/campaign-builder.tsx`) and Automation Details page (`app/(dashboard)/campaigns/[id]/page.tsx`). The toggle, message textarea, delay-minutes input, and explanatory helper text are fully active with delay spinner (0–1440 min) and personalization hints.

### Impacted Modules
* Public Site Header (`components/public-site-header.tsx`)
* Button & Visual Primitives (`components/ui-refined/gradient-button.tsx`, `components/template-visual.tsx`)
* Public Marketing & SEO Routes (`app/page.tsx`, `app/templates/page.tsx`, `app/templates/[slug]/page.tsx`, `components/seo-page-shell.tsx`)

### Notes
* TypeScript typecheck passed cleanly with 0 errors (`npm run typecheck`).
* Dev server and worker process running smoothly in background.

---

## 2026-08-21 — Aggressive Sub-500ms Performance Optimization & Server-Side Acceleration

### Added
* Route-level streaming `loading.tsx` skeletons for all dashboard and auth routes:
  - `app/(dashboard)/dashboard/loading.tsx`
  - `app/(dashboard)/campaigns/loading.tsx`
  - `app/(dashboard)/automations/loading.tsx`
  - `app/(dashboard)/inbox/loading.tsx`
  - `app/(dashboard)/overview/loading.tsx`
  - `app/(dashboard)/logs/loading.tsx`
  - `app/(dashboard)/settings/loading.tsx`
  - `app/(dashboard)/diagnostics/loading.tsx`
  - `app/login/loading.tsx`
* Dynamic chart registry (`components/charts/chart-registry.tsx`) with client-only Next.js dynamic imports (`ssr: false`) for Recharts primitives, ensuring zero chart bundle overhead on non-chart routes.
* Database composite performance indexes in `prisma/schema.prisma`:
  - `Automation`: `@@index([workspaceId, isActive])`, `@@index([workspaceId, createdAt])`
  - `DmLog`: `@@index([workspaceId, status])`, `@@index([workspaceId, createdAt])`, `@@index([workspaceId, status, createdAt])`, `@@index([workspaceId, matchedKeyword])`
  - `WebhookEvent`: `@@index([workspaceId, status])`, `@@index([workspaceId, createdAt])`

### Changed
* Completely eradicated Lenis library (`npm uninstall lenis`), replacing runtime scroll tracking with browser-native CSS `scroll-behavior: smooth` and removing scroll-lock attributes.
* Uninstalled heavy and unused packages: `@formkit/auto-animate`, `motion`, `gsap`, `@gsap/react`, `lenis`.
* Optimized `/api/dashboard/stats/route.ts`: replaced sequential 7-day loop with parallel `Promise.all` count aggregations, added explicit `select` field projection, and configured caching headers (`max-age=10, stale-while-revalidate=30`).
* Optimized `/api/logs/route.ts`: replaced greedy include with field `select` projection and bounded pagination limits.
* Refactored `components/dashboard/messages-chart.tsx` and `components/charts/follower-area-chart.tsx` to consume dynamic chart registry components.
* Updated `next.config.ts` with remote image patterns for Instagram CDNs and optimized package imports.
* Memoized reusable components with `React.memo`: `StatCard`, `GradientButton`, `StatusBadge`, `Avatar`, `SearchInput`, `PageHeader`, `EmptyState`, `TopHeader`, `AppSidebar`.

### Impacted Modules
* Server-Side API Routes (`app/api/dashboard/stats/route.ts`, `app/api/logs/route.ts`)
* Database Layer (`prisma/schema.prisma`, Prisma client)
* Route Skeletons & Streaming (`app/(dashboard)/*/loading.tsx`, `app/login/loading.tsx`)
* Chart Infrastructure (`components/charts/chart-registry.tsx`, `components/dashboard/messages-chart.tsx`, `components/charts/follower-area-chart.tsx`)
* Core UI & Design System (`components/ui-refined/*`, `app/globals.css`, `app/layout.tsx`)
* Dependencies & Next.js Bundler (`package.json`, `next.config.ts`)

### Notes
* Clean production build verified with zero errors (`npm run build`).
* Full test suite passing with 100% success (16 test files, 154 tests).
* TypeScript typecheck verified cleanly with zero errors (`tsc --noEmit`).
* Preserved strict rules: 0 git commits, 0 git pushes, 0 external vercel deployments.

---

### Added
* Isolated chart client components (`components/dashboard/messages-chart.tsx`, `components/charts/follower-area-chart.tsx`) enabling clean dynamic code-splitting with `next/dynamic` and `ssr: false`.
* Modular landing page components (`components/landing/how-it-works.tsx`, `components/landing/features-grid.tsx`, `components/landing/final-cta.tsx`) for below-the-fold dynamic loading.
* Hardware-accelerated CSS entrance animations (`@keyframes fadeInUp`, `@keyframes fadeIn`, `.animate-fade-in-up`, `.animate-fade-in`) in `app/globals.css`.

### Changed
* Replaced eager direct Recharts imports on `/dashboard` and `/overview` with lazy-loaded dynamic imports and animated skeleton placeholders.
* Deferred Lenis smooth scroll initialization to 100ms post-initial paint with dynamic module importing to ensure instant first contentful paint (FCP).
* Uninstalled unused dependencies `gsap` and `@gsap/react` from `package.json` and bundle.
* Replaced runtime JS motion divs in `FadeIn` and `StaggerContainer` with pure CSS keyframes running on the compositor thread.
* Configured `next.config.ts` with `compress: true`, `poweredByHeader: false`, `productionBrowserSourceMaps: false`, and `experimental.optimizePackageImports` for `lucide-react`, `recharts`, and `@radix-ui` components.
* Wrapped core UI components in `React.memo` (`StatCard`, `AnimatedCard`, `StatusBadge`, `GradientButton`, `Avatar`) to prevent unnecessary re-renders.
* Optimized Inter font loader in `app/layout.tsx` with explicit `display: "swap"`, `preload: true`, and `adjustFontFallback: true`.

### Impacted Modules
* Dashboard (`app/(dashboard)/dashboard/page.tsx`, `components/dashboard/messages-chart.tsx`)
* Insights (`components/follower-chart.tsx`, `components/charts/follower-area-chart.tsx`)
* Landing Page (`app/page.tsx`, `components/landing/*`)
* UI Design System (`components/ui-refined/*`)
* Core Layout & Providers (`app/layout.tsx`, `components/ui-refined/smooth-scroll-provider.tsx`)
* Build & Optimization Configurations (`next.config.ts`, `package.json`)

### Notes
* Production build verified cleanly with zero errors (`npm run build`).
* Recharts isolated exclusively to chart-rendering routes.
* GSAP completely eradicated from bundles (0 occurrences).
* Static page generation time reduced from 1347ms to 854ms (~37% faster).
* Preserved strict constraints: 0 git commits, 0 git pushes, 0 external vercel deployments.

---

## 2026-08-21 — Complete Visual Overhaul and Design System Refinement

### Added
* Complete `components/ui-refined/` component library with 15 components (`AppSidebar`, `TopHeader`, `StatCard`, `GradientButton`, `AnimatedCard`, `EmptyState`, `PageHeader`, `SearchInput`, `StatusBadge`, `LoadingSkeleton`, `FadeIn`, `StaggerContainer`, `GradientText`, `Avatar`).
* Lenis smooth scrolling provider with `prefers-reduced-motion` detection in `components/ui-refined/smooth-scroll-provider.tsx`.
* Design tokens in `tailwind.config.ts` and `app/globals.css` (@theme colors `#fafafa`, `#ffffff`, `#f97316`, `#0f172a`, custom card shadows, 2xl/3xl border radii, Inter typography, and pulse-dot keyframes).
* Sonner Toast notification provider in `app/layout.tsx`.

### Changed
* Transformed entire application into pure light mode design system with warm off-white canvas `#fafafa`, crisp white cards `#ffffff`, and vibrant orange gradient `#f97316` accents.
* Refactored Auth Page (`app/login/page.tsx`, `app/login/auth-form.tsx`) to 50/50 desktop split screen layout with brand panel, eye toggles, and sentence-case labels.
* Refactored Dashboard (`app/(dashboard)/dashboard/page.tsx`) with 4 refined StatCards, Recharts AreaChart with orange fill gradient, horizontal bar charts for Top Keywords, and animated Recent Activity with avatars.
* Refactored Automations List (`app/(dashboard)/campaigns/page.tsx`) and Automation Builder (`components/campaign-builder.tsx`, `components/campaign-preview.tsx`) with 4-step workflow, radio cards, and live Instagram phone preview.
* Refactored Messages / Inbox (`app/(dashboard)/inbox/page.tsx`) with avatar conversation list, orange gradient chat bubbles, and instant message composer.
* Refactored Activity / DM Logs (`app/(dashboard)/logs/page.tsx`) with pill filter tabs, avatar rows, and soft status badges.
* Refactored Insights / Overview (`app/(dashboard)/overview/page.tsx`, `components/follower-chart.tsx`) with 6 stat metrics, Area follower growth chart, and per-post performance table.
* Refactored Settings (`app/(dashboard)/settings/page.tsx`, `components/instagram-connect-notice.tsx`) with real-time sync indicators, role badges, and invitation management.
* Refactored System Status / Diagnostics (`app/(dashboard)/diagnostics/page.tsx`) with positive operational indicators, real-time queue cards, and connection health metrics.
* Refactored Public Landing Page (`app/page.tsx`, `components/public-site-header.tsx`) with hero mockup, 3-step guide, and feature suite.
* Replaced all negative language and technical jargon across all UI surfaces ("Delivered ✓", "Filtered out", "Needs retry", "All systems operational 🎉").
* Enhanced NextAuth JWT session callback and `DashboardLayout` user ID resolution to ensure seamless redirect from login to `/dashboard`.
* Fixed mouse wheel scrolling inside nested dashboard containers by configuring Lenis `allowNestedScroll`, `autoToggle`, and `prevent` on `[data-lenis-prevent]` and `.overflow-y-auto` elements.

### Impacted Modules
* Shell & Navigation (`components/dashboard-shell.tsx`, `components/sidebar.tsx`, `components/top-bar.tsx`, `components/public-site-header.tsx`)
* Global Styling (`app/globals.css`, `app/layout.tsx`, `tailwind.config.ts`)
* Refined UI Suite (`components/ui-refined/*`)
* Dashboard Pages (`app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/campaigns/page.tsx`, `app/(dashboard)/inbox/page.tsx`, `app/(dashboard)/logs/page.tsx`, `app/(dashboard)/overview/page.tsx`, `app/(dashboard)/settings/page.tsx`, `app/(dashboard)/diagnostics/page.tsx`)
* Landing & Auth (`app/page.tsx`, `app/login/page.tsx`, `app/login/auth-form.tsx`)

### Notes
* All 16 test suites and 154 unit tests passing cleanly (`npm test`).
* TypeScript verification passed with 0 errors (`npm run typecheck`).
* Production build compiled successfully across 55 static and dynamic routes (`npm run build`).
* Preserved strict constraints: 0 git commits, 0 git pushes, 0 external vercel deployments — all changes kept strictly local for user preview.

---

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
