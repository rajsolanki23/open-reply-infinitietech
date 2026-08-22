# OpenReply UI/UX Refinement — Rules, Execution & Agent Prompt

> **Purpose:** Critical constraints, execution order, testing checklist, and the single prompt to give the Antigravity agent.

---

## SECTION 1: ABSOLUTE RULES (NEVER BREAK)

### 1.1 Backend is Untouchable
- **NEVER** modify: `app/api/`, `lib/`, `prisma/`, `worker/`, auth config, webhook handlers, server actions, middleware, environment variables
- **NEVER** change: Database schema, API routes, business logic, data fetching patterns, session handling, encryption, token refresh logic
- **NEVER** change: Form submission endpoints, redirect URLs, OAuth flows

### 1.2 UI-Only Changes
- **ONLY** modify: JSX/TSX files, CSS files, component files
- **ONLY** change: How data is DISPLAYED, not how it is FETCHED
- **Preserve** all existing: `useEffect`, `useQuery`, `fetch`, Prisma client calls, form `onSubmit` handlers, API route imports

### 1.3 No Dark Mode
- Light mode **ONLY** throughout entire app
- **NO** `dark:` Tailwind variants
- **NO** system preference detection for dark mode
- **NO** dark mode toggle

### 1.4 No Heavy 3D Libraries
- **NO** Three.js
- **NO** React Three Fiber (@react-three/fiber)
- **NO** @react-three/drei
- **NO** Lottie (requires external animation files)
- **NO** Rive
- Use **CSS transforms + Motion** for all animations

### 1.5 Creator-First Language (ENFORCED)
- **BANNED words in UI:** Failed, Error, Crash, Broken, Dead, Webhook, Token, Queue, Worker, Heartbeat, OAuth, Redirect URI, Graph API, DM (as noun in labels), Logs, Campaign, Production, Diagnostics, ALL CAPS labels
- **ALLOWED:** Message, messages, reply, replies, Automation, automations, Activity, history, Connection, sync, Delivered, sending, retry, Insights, dashboard

### 1.6 Naming Enforcement
Before marking ANY page complete, verify:
- [ ] No "DM" in page titles (use "Messages")
- [ ] No "Logs" in navigation (use "Activity")
- [ ] No "Campaign" in user-facing text (use "Automation")
- [ ] No "Failed" status labels (use "Needs retry" or "Didn't send")
- [ ] No technical jargon in UI
- [ ] Sentence case for ALL buttons and labels
- [ ] Status badges use new naming from 02_NAMING_CONVENTIONS.md

---

## SECTION 2: EXECUTION ORDER

Follow this EXACT sequence. Do not skip steps.

### Phase 1: Discovery (Read-Only)
1. Read all 4 md files in docs/ui-refinement/ folder
2. Read existing codebase structure:
   - `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`
   - All page files in `app/` directory
   - Existing components in `components/`
   - Existing shadcn components in `components/ui/`
3. Report findings: current file list, existing design system, what needs changing

### Phase 2: Foundation
4. Run installation commands from 01_DESIGN_SYSTEM.md Section 7
5. Update `tailwind.config.ts` with custom shadows and font
6. Update `app/globals.css` with utilities and animations
7. Update `app/layout.tsx` with Inter font, Lenis provider, Sonner toaster
8. Create `components/ui-refined/smooth-scroll-provider.tsx`

### Phase 3: Global Components
9. Create ALL components in `components/ui-refined/`:
   - app-sidebar.tsx
   - top-header.tsx
   - stat-card.tsx
   - gradient-button.tsx
   - animated-card.tsx
   - empty-state.tsx
   - page-header.tsx
   - search-input.tsx
   - status-badge.tsx
   - loading-skeleton.tsx
   - fade-in.tsx
   - stagger-container.tsx
   - gradient-text.tsx
   - avatar.tsx
10. Test build: `npm run build` — fix any errors

### Phase 4: Page Refactors (IN THIS ORDER)
11. Auth page (lowest risk)
12. Dashboard (highest visibility)
13. Automations list + Create automation
14. Messages (Inbox)
15. Activity (DM Logs)
16. Insights (Overview)
17. Settings
18. System Status (Diagnostics)
19. Landing page (lowest priority)

### Phase 5: Final Verification
20. Run `npm run build` — zero errors
21. Verify responsiveness at 375px, 768px, 1440px
22. Verify no backend files modified (check git diff)
23. Verify all naming conventions applied

---

## SECTION 3: FILE STRUCTURE

```
components/
  ui/                          # Existing shadcn (keep as-is)
  ui-refined/                  # NEW — all your components
    app-sidebar.tsx
    top-header.tsx
    stat-card.tsx
    gradient-button.tsx
    animated-card.tsx
    empty-state.tsx
    page-header.tsx
    search-input.tsx
    status-badge.tsx
    loading-skeleton.tsx
    fade-in.tsx
    stagger-container.tsx
    gradient-text.tsx
    avatar.tsx
    smooth-scroll-provider.tsx
```

**Do NOT delete existing `components/ui/` files.** Keep them for shadcn primitives. Create new components in `ui-refined/`.

---

## SECTION 4: RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | 320px - 639px | Single column, bottom nav or hamburger, stacked cards, full-width inputs |
| Tablet | 640px - 1023px | 2-column grids, sidebar collapsible, medium padding |
| Desktop | 1024px+ | Full sidebar, multi-column dashboards, max-w-7xl containers |

**Critical mobile rules:**
- Sidebar becomes Sheet (slide from left)
- Stat cards: 2 columns
- Tables: horizontal scroll or card view
- Chat: full screen conversation list, tap to open chat
- Forms: full width inputs, stacked layout

---

## SECTION 5: TESTING CHECKLIST

For each page, verify ALL of these:

- [ ] Page loads without errors
- [ ] Data still loads from existing API/hooks
- [ ] All buttons still work (same onClick handlers)
- [ ] All forms still submit (same onSubmit handlers)
- [ ] No console errors
- [ ] Animations work (cards fade in, hover effects)
- [ ] Empty states show when no data
- [ ] Loading skeletons show during fetch
- [ ] Responsive at 375px, 768px, 1440px
- [ ] All labels use sentence case
- [ ] No banned words in UI
- [ ] Status badges use new naming
- [ ] Navigation labels updated
- [ ] `npm run build` passes

---

## SECTION 6: TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `npm run build` fails with Motion error | Add `'use client'` at top of file |
| TypeScript type error on existing prop | Keep existing type, don't change interface |
| shadcn component not found | Run `npx shadcn@latest add [component-name]` |
| Animation not working | Check `prefers-reduced-motion` wrapper |
| Layout broken on mobile | Check flex/grid classes, add `flex-col` on small screens |
| Data not showing | Verify you didn't change data fetching logic |
| Old component still showing | Check import paths, ensure new component is imported |

---

## SECTION 7: THE SINGLE PROMPT

Copy-paste this EXACT prompt into a new Antigravity conversation (Ctrl + N):

```
You are a senior UI/UX engineer. Execute a complete visual overhaul of the OpenReply project.

STEP 1: Read these 4 files in the docs/ui-refinement/ folder in order:
  1. 01_DESIGN_SYSTEM.md
  2. 02_NAMING_CONVENTIONS.md
  3. 03_COMPONENTS_AND_PAGES.md
  4. 04_RULES_AND_PROMPT.md (this file)

STEP 2: Read the existing codebase to understand current file structure, pages, and components.

STEP 3: Execute the refinement in the exact order specified in SECTION 2 of 04_RULES_AND_PROMPT.md.

STEP 4: For each step, follow the design system in 01_DESIGN_SYSTEM.md exactly. Apply naming conventions from 02_NAMING_CONVENTIONS.md strictly. Build components per 03_COMPONENTS_AND_PAGES.md.

CRITICAL CONSTRAINTS — NEVER BREAK THESE:
- ONLY modify UI files (JSX, TSX, CSS). NEVER touch API routes, database schema, auth logic, webhooks, server actions, or business logic.
- Preserve all existing data fetching hooks, form submissions, and API calls.
- Light mode ONLY. No dark mode anywhere.
- Use open-source tools only: Motion, GSAP, Lenis, shadcn/ui, Recharts, Lucide. NO Three.js.
- Remove all negative language ("Failed", "Error", "Broken") and technical jargon ("Webhook", "Token", "Queue", "Worker") from user-facing text.
- Rename: Campaigns→Automations, DM Logs→Activity, Overview→Insights, Diagnostics→System Status.
- Every page must be responsive: 375px mobile, 768px tablet, 1440px desktop.
- After each major page refactor, run `npm run build` and fix TypeScript errors immediately.
- Add 'use client' to any file using Motion or GSAP.
- All labels must be sentence case. No ALL CAPS.

Begin now. Read the 4 guide files first, then report your understanding of the current codebase before executing.
```

---

## SECTION 8: POST-EXECUTION CHECKLIST

After the agent finishes, verify manually:

1. Open the app in browser
2. Check each page: Dashboard, Insights, Messages, Automations, Activity, Settings, System Status
3. Verify navigation labels match 02_NAMING_CONVENTIONS.md
4. Verify no "Failed", "Error", "Webhook", "Token", "Queue", "Worker" in any visible text
5. Test on mobile viewport (DevTools 375px)
6. Test on tablet (768px)
7. Test on desktop (1440px)
8. Verify buttons work, forms submit, data loads
9. Run `npm run build` one final time
10. Commit changes with message: "ui: complete visual overhaul — creator-friendly design"
