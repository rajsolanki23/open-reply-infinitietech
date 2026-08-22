# OpenReply UI/UX Refinement — Components & Page Refactors

> **Purpose:** Complete specifications for all reusable components and every page refactor. The agent must build components first, then refactor pages in the exact order listed.

---

## PART A: GLOBAL COMPONENTS

Create ALL of these in `components/ui-refined/` before touching any page.

---

### 1. AppSidebar (`components/ui-refined/app-sidebar.tsx`)

**Structure:**
- Width: 240px desktop, collapsible icon-only at 72px on hover or toggle
- Mobile: Sheet component sliding from left, full width 280px
- Background: white, border-r border-slate-100
- Padding: py-4 px-3

**Nav Items (in order):**
1. Dashboard — LayoutDashboard icon
2. Insights — BarChart3 icon (was Overview)
3. Messages — MessageCircle icon (was Inbox)
4. Automations — Zap icon (was Campaigns)
5. Activity — Activity icon (was DM Logs)
6. Settings — Settings icon
7. System Status — HeartPulse icon (was Diagnostics)

**Active Item Style:**
- Left border: 3px solid gradient (orange-500)
- Background: bg-orange-50/50
- Text: text-orange-700 font-medium
- Icon: text-orange-500
- Border radius: rounded-r-xl (only right side rounded)

**Inactive Item Style:**
- Text: text-slate-500
- Hover: bg-slate-50, text-slate-900
- Border radius: rounded-xl

**Bottom Section:**
- Separator: border-t border-slate-100 my-4
- Workspace card: rounded-xl, bg-slate-50, p-3
  - Workspace name: text-sm font-medium text-slate-900
  - "Self-hosted" badge: rounded-full, bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5
- User row: flex items-center gap-3, px-3 py-2
  - Avatar: 40px rounded-full, gradient bg with initials if no image
  - Name: text-sm font-medium text-slate-900 truncate max-w-[140px]
  - "Sign out" button: text-xs text-slate-400 hover:text-slate-600

**Mobile:**
- Trigger: hamburger menu button in TopHeader
- Sheet: white bg, border-r-0, shadow-elevated

---

### 2. TopHeader (`components/ui-refined/top-header.tsx`)

**Structure:**
- Height: 64px
- Background: white/80 backdrop-blur-md, border-b border-slate-100
- Position: sticky top-0 z-50
- Padding: px-6

**Left:**
- Mobile: Hamburger menu button (Sheet trigger)
- Page title: text-lg font-semibold text-slate-900
- Breadcrumb (if applicable): text-sm text-slate-400 with chevron separator

**Right:**
- Instagram connection status: small dot (green if connected) + "@{handle}" text-sm text-slate-500
- Avatar: 32px rounded-full
- Sign out: text-sm text-slate-400 hover:text-slate-600

---

### 3. StatCard (`components/ui-refined/stat-card.tsx`)

```tsx
interface StatCardProps {
  title: string;                    // e.g. "Messages sent"
  value: string | number;           // e.g. "1,284"
  change?: {
    value: number;                  // e.g. 12
    label: string;                  // e.g. "from last week"
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  accent: "orange" | "violet" | "emerald" | "rose" | "amber" | "blue";
}
```

**Design:**
- Container: rounded-2xl, bg-white, border border-slate-100, shadow-card, p-5
- Icon container: 40px × 40px, rounded-xl
  - orange: bg-orange-50, icon text-orange-500
  - violet: bg-violet-50, icon text-violet-500
  - emerald: bg-emerald-50, icon text-emerald-500
  - rose: bg-rose-50, icon text-rose-500
  - amber: bg-amber-50, icon text-amber-500
  - blue: bg-blue-50, icon text-blue-500
- Value: text-2xl font-bold text-slate-900 mt-3
- Title: text-sm text-slate-500 mt-1
- Change badge (if provided): rounded-full, px-2 py-0.5, text-xs font-medium mt-2 inline-flex items-center gap-1
  - up: bg-emerald-50 text-emerald-600
  - down: bg-rose-50 text-rose-600
  - neutral: bg-slate-50 text-slate-500
- Hover: shadow-card-hover, translateY(-2px), transition-all duration-200

---

### 4. GradientButton (`components/ui-refined/gradient-button.tsx`)

```tsx
interface GradientButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Primary:**
- bg-gradient-to-r from-orange-500 to-orange-400
- text-white font-medium
- rounded-xl (lg size: rounded-full)
- h-11 px-6 (sm: h-9 px-4, lg: h-12 px-8)
- shadow-glow
- hover: brightness-110, scale(1.02)
- active: scale(0.98)
- disabled: opacity-50, cursor-not-allowed

**Secondary:**
- bg-white, border border-slate-200
- text-slate-700 font-medium
- rounded-xl, h-11 px-6
- hover: border-orange-300, text-orange-600, bg-orange-50/30

**Ghost:**
- bg-transparent
- text-slate-500
- hover: bg-slate-50, text-slate-900

**Danger:**
- bg-white, border border-rose-200
- text-rose-600
- hover: bg-rose-50, border-rose-300

**Loading state:**
- Show spinner icon (animate-spin) left of text
- Disable interactions

---

### 5. AnimatedCard (`components/ui-refined/animated-card.tsx`)

Wrapper component using Motion:

```tsx
'use client';
import { motion } from 'motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className = "", delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -2 } : undefined}
      className={`rounded-2xl bg-white border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

---

### 6. EmptyState (`components/ui-refined/empty-state.tsx`)

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}
```

**Design:**
- Container: flex flex-col items-center justify-center, py-16 px-4
- Icon wrapper: 80px × 80px, rounded-full, bg-slate-50, flex items-center justify-center
- Icon: 32px, text-slate-300
- Title: text-lg font-semibold text-slate-900 mt-4
- Description: text-sm text-slate-500 mt-1 text-center max-w-sm
- Action: mt-6, GradientButton secondary

---

### 7. PageHeader (`components/ui-refined/page-header.tsx`)

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

**Design:**
- Container: flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
- Title: text-2xl font-bold text-slate-900
- Description: text-sm text-slate-500 mt-1
- Action: flex items-center gap-3
- Bottom border: border-b border-slate-100 pb-6 mb-6

---

### 8. SearchInput (`components/ui-refined/search-input.tsx`)

```tsx
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
```

**Design:**
- Container: relative
- Input: w-full, rounded-xl, bg-slate-50, border-slate-200, h-11, pl-10 pr-10
- Left icon: Search, 16px, text-slate-400, absolute left-3
- Focus: bg-white, border-orange-400, ring-2 ring-orange-100
- Clear button: X icon, absolute right-3, text-slate-400 hover:text-slate-600, appears when value.length > 0
- Placeholder: text-slate-400

---

### 9. StatusBadge (`components/ui-refined/status-badge.tsx`)

```tsx
type Status = "active" | "paused" | "delivered" | "sending" | "needs_retry" | "filtered" | "connected" | "disconnected";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}
```

**Mapping:**

| Status | Display Text | Classes |
|--------|--------------|---------|
| active | Active | bg-emerald-50 text-emerald-700 border border-emerald-200 |
| paused | Paused | bg-amber-50 text-amber-700 border border-amber-200 |
| delivered | Delivered | bg-emerald-50 text-emerald-700 border border-emerald-200 |
| sending | Sending... | bg-amber-50 text-amber-700 border border-amber-200 + animate-pulse |
| needs_retry | Retry needed | bg-rose-50 text-rose-700 border border-rose-200 |
| filtered | Filtered out | bg-slate-50 text-slate-600 border border-slate-200 |
| connected | Connected | bg-emerald-50 text-emerald-700 border border-emerald-200 + green dot |
| disconnected | Disconnected | bg-slate-50 text-slate-500 border border-slate-200 |

**All:** rounded-full, px-2.5 py-0.5, text-xs font-medium, inline-flex items-center gap-1.5

---

### 10. LoadingSkeleton (`components/ui-refined/loading-skeleton.tsx`)

Use shadcn Skeleton with custom styling:
- Base: bg-slate-100 rounded-xl
- Stat cards: 4 cards in grid, each with 40px circle + 2 lines
- Table: 6 rows, each with 4 columns of varying widths
- List: 5 items, each with avatar circle + 2 lines
- Pulse animation (default shadcn)

---

### 11. FadeIn (`components/ui-refined/fade-in.tsx`)

```tsx
'use client';
import { motion } from 'motion';
import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, direction = "up", delay = 0, duration = 0.3, className = "" }: FadeInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

### 12. StaggerContainer (`components/ui-refined/stagger-container.tsx`)

```tsx
'use client';
import { motion } from 'motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.05, className = "" }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

### 13. GradientText (`components/ui-refined/gradient-text.tsx`)

```tsx
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "accent";
}

export function GradientText({ children, className = "", variant = "primary" }: GradientTextProps) {
  const gradient = variant === "primary" 
    ? "bg-gradient-to-r from-orange-600 to-orange-400" 
    : "bg-gradient-to-r from-violet-600 to-pink-500";
  return (
    <span className={`${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
```

---

### 14. Avatar (`components/ui-refined/avatar.tsx`)

```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline";
}
```

**Sizes:**
- sm: 32px, text-xs
- md: 40px, text-sm
- lg: 56px, text-base

**Design:**
- If src: next/image with rounded-full, object-cover
- If no src: gradient-accent background, white text initials (first letter of each word, max 2)
- Status dot (if provided): 10px circle, absolute bottom-right
  - online: bg-emerald-500, border-2 border-white
  - offline: bg-slate-300, border-2 border-white

---

## PART B: PAGE-BY-PAGE REFACTORS

**CRITICAL:** Only modify JSX/TSX and CSS. Preserve all data fetching, API calls, form submissions, and business logic hooks.

---

### PAGE 1: Auth Page (app/login/ or app/auth/)

**Current Issues:**
- Extremely plain white page, no visual interest
- ALL CAPS labels (FULL NAME, EMAIL ADDRESS)
- No context about what OpenReply does
- No social proof or branding on the page

**New Layout:**

**Desktop (split screen 50/50):**
- **Left panel** (gradient background):
  - Background: gradient-primary
  - Content centered vertically:
    - OpenReply logo/wordmark (white, large)
    - Tagline: "Automate your Instagram DMs" (white/90, text-xl)
    - 3 bullet points with white checkmark icons:
      - "Reply to comments instantly"
      - "Grow your audience on autopilot"
      - "100% free and open source"
    - Decorative: subtle floating circles (CSS-only, opacity-10, animate-float)
- **Right panel** (white):
  - Centered card: max-w-md, w-full
  - Card: rounded-3xl, shadow-elevated, bg-white, p-8
  - Tabs: "Sign in" / "Create account"
    - Pill toggle style
    - Active: bg-slate-100 text-slate-900 font-medium
    - Inactive: text-slate-400
  - Form fields:
    - "Full name" (not "FULL NAME (OPTIONAL)")
    - "Email" (not "EMAIL ADDRESS")
    - "Password" (not "PASSWORD")
    - "Confirm password" (not "CONFIRM PASSWORD")
    - All labels: text-sm font-medium text-slate-700, sentence case
    - All inputs: SearchInput styling (rounded-xl, bg-slate-50, focus:border-orange-400)
    - Password fields: eye icon toggle
  - Submit button: GradientButton primary, full width, "Sign in" or "Create account"
  - Below form: "By signing in, you agree to our Terms and Privacy" — text-xs text-slate-400, links in orange

**Mobile:**
- Stack vertically
- Top: compact gradient section with logo + tagline only
- Below: white card with form

---

### PAGE 2: Dashboard (app/dashboard/page.tsx)

**Current Issues:**
- "Hello, {email}!" — impersonal, exposes email
- Stat cards are plain bordered boxes, no icons, no colors
- "Failed" stat is negative framing
- Chart is tiny and basic
- "Top Keywords" is just a text list
- "Recent Activity" lacks avatars and visual polish

**New Layout:**

**Header:**
- "Welcome back 👋" (text-2xl font-bold)
- Subtitle: "{n} accounts connected · {m} people reached · View all activity"
- "View all activity" = orange text link, hover:underline

**Stats Row (4 cards):**
1. **Active automations** — Zap icon, orange accent, value + trend
2. **Messages sent** — Send icon, violet accent, value + trend
3. **Link clicks** — MousePointerClick icon, emerald accent, value + trend
4. **Click-through rate** — TrendingUp icon, pink accent, value + trend
- Grid: 2 cols mobile, 4 cols desktop, gap-4
- Use StatCard component
- REMOVE "Failed" from main dashboard stats (move to Activity page)

**Messages Over Time Chart:**
- Card: AnimatedCard, p-6
- Title: "Messages over time" (not "DMs — Last 7 Days")
- Chart: Recharts AreaChart
  - Gradient fill: from orange-500 to transparent
  - Line: orange-500, strokeWidth 2
  - Dots on hover
  - Tooltip: rounded-lg, shadow, white bg, border border-slate-100
  - Height: 300px

**Top Keywords:**
- Card: AnimatedCard, p-6
- Title: "Top keywords"
- Instead of plain list, use horizontal bar chart:
  - Keyword label left: text-sm font-medium
  - Bar: rounded-full, gradient-primary, height 8px, width proportional to count
  - Count right-aligned: text-sm text-slate-500
- Much more visual than text list

**Recent Activity:**
- Card: AnimatedCard, p-6
- Title: "Recent activity"
- List items (use @formkit/auto-animate):
  - Avatar: 40px, rounded-full, gradient bg with initials
  - Name: font-medium text-slate-900
  - Action: "Sent {automation name}" — text-sm text-slate-500
  - Time: text-xs text-slate-400
  - Status dot: emerald for delivered, amber for sending
- "View all" link at bottom: text-sm text-orange-500 hover:text-orange-600

---

### PAGE 3: Insights (app/insights/ or app/overview/) — was Overview

**Current Issues:**
- "Overview" is generic
- Native HTML select for range — ugly
- Stats row plain
- Chart okay but small
- Posts table very basic

**New Layout:**

**Header:**
- Title: "Insights"
- Subtitle: "Recent activity from @{handle}"
- Right: Range selector using shadcn Select component
  - Trigger: rounded-xl, bg-white border border-slate-200, h-10, px-4
  - Options: Last 25 posts, Last 50, Last 100, All time
  - ChevronDown icon

**Stats Row (6 StatCards):**
- Views — Eye icon, violet accent
- Reach — Users icon, orange accent
- Likes — Heart icon, rose accent
- Comments — MessageCircle icon, blue accent
- Saved — Bookmark icon, amber accent
- Shares — Share icon, emerald accent
- Grid: 3 cols mobile, 6 cols desktop

**Follower Growth Chart:**
- Card: AnimatedCard, p-6
- Title: "Follower growth"
- Subtitle: "{count} now · +{change} over 30 days" (green text if positive)
- Chart: Recharts LineChart
  - Smooth curve (type="monotone")
  - Gradient stroke: from violet-500 to pink-500
  - Fill: gradient from violet-500/10 to transparent
  - Height: 300px
- "Show table" button: top-right, ghost, small

**Posts Table:**
- Card: AnimatedCard, overflow-hidden
- Title: "Recent posts" (inside card header with padding)
- Table styling:
  - Header: text-xs uppercase tracking-wider text-slate-400, bg-slate-50/50, py-3 px-4
  - Rows: hover:bg-slate-50, transition-colors, border-b border-slate-50 last:border-0
  - Thumbnail: 40×40 rounded-lg object-cover
  - Post name: truncate, text-sm font-medium text-slate-900, max-w-[300px]
  - Stats: centered, text-sm text-slate-600
  - Date: text-xs text-slate-400
- Pagination or "Load more" at bottom

---

### PAGE 4: Messages (app/messages/ or app/inbox/) — was Inbox

**Current Issues:**
- No avatars in conversation list
- Plain message bubbles
- No unread indicators
- Send button basic
- No message status indicators

**New Layout:**

**Container:** flex h-[calc(100vh-64px)]

**Left: Conversation List (320px, border-r border-slate-100)**
- Header: "Messages" + SearchInput "Search conversations..."
- List (use @formkit/auto-animate):
  - Item: flex items-center gap-3, px-4 py-3, hover:bg-slate-50, cursor-pointer
  - Avatar: 44px, rounded-full
  - Unread indicator: 8px orange dot, absolute top-right of avatar, animate-pulse-dot
  - Name: text-sm font-medium text-slate-900
  - Preview: text-sm text-slate-500 truncate max-w-[180px]
  - Time: text-xs text-slate-400, absolute right-4
  - Active state: bg-orange-50, left border 3px orange-500

**Right: Chat Area (flex-1, flex flex-col)**
- Header: border-b border-slate-100, px-6 py-4, flex items-center gap-3
  - Avatar: 40px
  - Name: font-medium text-slate-900
  - Status: "Active now" or "Last seen {time}" — text-xs text-slate-400
  - Actions: MoreVertical icon button (ghost)

- Messages area: flex-1 overflow-y-auto, px-6 py-4, space-y-4
  - Received bubble:
    - bg-slate-100, rounded-2xl rounded-tl-sm
    - text-slate-900, text-sm
    - max-w-[70%], px-4 py-2.5
  - Sent bubble:
    - gradient-primary, rounded-2xl rounded-tr-sm
    - text-white, text-sm
    - max-w-[70%], px-4 py-2.5, ml-auto
  - Time below each: text-[10px] text-slate-400, mt-1
  - Status: single check = sent, double check = delivered (if data available)

- Input area: border-t border-slate-100, p-4
  - Container: flex items-center gap-3
  - Input: flex-1, rounded-full, bg-slate-100 border-0, h-12, px-5, focus:bg-white focus:ring-2 focus:ring-orange-100
  - Placeholder: "Type a message..."
  - Send button: 40px circle, gradient-primary, Send icon white, hover:scale-105
  - Hint: "Press Enter to send" — text-xs text-slate-400 below input

---

### PAGE 5: Automations (app/automations/ or app/campaigns/) — was Campaigns

**Current Issues:**
- "1 campaign" text lonely
- Search bar basic
- Campaign cards too dense
- "Copy URL" unclear
- Toggle switch native

**New Layout:**

**Header:**
- Title: "Automations"
- Subtitle: "{n} active" or "No automations yet"
- Actions row: flex items-center gap-3
  - SearchInput: "Search automations..." (flex-1 max-w-md)
  - Filter tabs: pill style
    - "All" / "Active" / "Paused"
    - Active tab: bg-slate-900 text-white rounded-full px-4 py-1.5 text-sm
    - Inactive: text-slate-500 hover:text-slate-900
  - GradientButton primary with Zap icon: "Create automation"

**Empty State:**
- Icon: Zap in 80px circle, bg-slate-50, text-slate-300
- Title: "No automations yet"
- Description: "Create your first automation to start replying to comments automatically."
- Action: "Create automation" GradientButton

**Automation Cards:**
- Card: AnimatedCard, p-5
- Layout:
  - Top row: flex items-center gap-3
    - Post thumbnail: 48px rounded-lg object-cover
    - Title: "@{handle} — Auto-reply" (text-base font-semibold)
    - Handle: text-sm text-slate-500
    - StatusBadge: active/paused
    - Actions: DropdownMenu with Edit, Duplicate, Delete
  - Keywords: flex flex-wrap gap-2 mt-3
    - Each: rounded-full, bg-orange-50 text-orange-700, border border-orange-100, px-2.5 py-0.5, text-xs font-medium
  - Message preview: text-sm text-slate-500 truncate italic mt-2
  - Stats row: flex items-center gap-4 mt-3, text-xs text-slate-400
    - "{n} runs" · "{n} sent" · "{n} clicks" · "{ctr}% click-through rate"
  - Bottom row: flex items-center justify-between mt-4 pt-4 border-t border-slate-50
    - Toggle switch: shadcn Switch with orange checked state (bg-orange-500 when checked)
    - "Copy link" button: ghost, small, Link icon + text
    - "Edit" button: ghost, small, Pencil icon + text
- Hover: shadow-card-hover, translateY(-2px)

---

### PAGE 6: Create Automation (app/automations/new/) — was New Campaign

**Current Issues:**
- Phone mockup completely black
- Post thumbnails tiny
- No step progress
- Form too vertical

**New Layout:**

**Step Indicator (top, sticky):**
- 4 steps with connecting line:
  1. Choose post → 2. Set keywords → 3. Write reply → 4. Review
- Horizontal, max-w-2xl mx-auto
- Active step: orange circle (32px) with white number, orange text below
- Completed: checkmark in emerald circle, emerald text
- Future: slate circle (32px), slate text
- Connecting line: 2px, gradient from completed color to future color
- Use AnimatePresence for step content transitions

**Left: Form (60% desktop)**
- Card: AnimatedCard, p-6
- Step 1 — Choose post:
  - Radio cards (not plain radio):
    - "Choose a post or reel" — selected shows post grid below
    - "Any of my posts"
    - "My next post"
  - Post grid (when first option selected):
    - Grid: 4 cols, gap-3
    - Thumbnails: 80px, rounded-xl, object-cover
    - Hover: ring-2 ring-orange-400, scale(1.02)
    - Selected: ring-2 ring-orange-500, shadow-glow
    - "Show more" button: ghost, full width
- Step 2 — Keywords:
  - Label: "Reply when comment contains..."
  - Tag input: type and press Enter to create tag
  - Tags: rounded-full, bg-orange-50 text-orange-700, border border-orange-100, removable (X)
  - Helper: "Press Enter to add a keyword" — text-xs text-slate-400
- Step 3 — Write reply:
  - Label: "Write your reply message"
  - Textarea: rounded-xl, min-h-[120px], bg-slate-50 border-slate-200
  - Focus: bg-white, border-orange-400, ring-2 ring-orange-100
  - Helper: "Use {username} to personalize the message" — text-xs text-slate-400
  - Checkbox: "Require follow to unlock" with description
- Step 4 — Review:
  - Summary card showing all choices
  - Post preview thumbnail
  - Keywords list
  - Message preview
  - Actions: "Back" ghost + "Publish automation" GradientButton primary large with Sparkles icon

**Right: Preview Panel (40% desktop, sticky top-24)**
- iPhone mockup frame (CSS-only):
  - Outer: rounded-[40px], border-8 border-slate-900, shadow-elevated, bg-slate-900
  - Screen: rounded-[32px], bg-white, overflow-hidden, aspect-[9/19]
  - Header: Instagram-style DM header
    - Back arrow + avatar + "@{handle}" + call icon
  - Message bubble: gradient-primary, rounded-2xl, text-white, px-4 py-3
    - Shows actual message with {username} replaced by "@username"
  - Bottom: "Sent with OpenReply" — text-[10px] text-slate-400 text-center pb-4
- Updates LIVE as user types

**Bottom Actions:**
- "Save as draft" — GradientButton ghost
- "Publish automation" — GradientButton primary, large

---

### PAGE 7: Activity (app/activity/ or app/dm-logs/) — was DM Logs

**Current Issues:**
- Technical filter tabs (RATE LIMIT, PLAN LIMIT, DEDUP)
- Plain table
- No search
- "Failed" language

**New Layout:**

**Header:**
- Title: "Activity"
- Subtitle: "Track every message and reply"

**Filters:**
- Search: SearchInput "Search by username, keyword, or message..."
- Status tabs (pill style):
  - "All" / "Delivered ✓" / "Sending..." / "Retry needed" / "Filtered out"
  - Active: bg-slate-900 text-white
  - Inactive: text-slate-500 hover:text-slate-900
- **REMOVE:** RATE LIMIT, PLAN LIMIT, DEDUP tabs entirely

**Table:**
- Card: AnimatedCard, overflow-hidden
- Columns:
  - Person: Avatar (32px) + username, flex items-center gap-2
  - Comment: text-sm text-slate-600, truncate max-w-[200px]
  - Automation: text-sm text-slate-900 font-medium
  - Account: text-sm text-slate-500
  - Status: StatusBadge component
  - Time: text-xs text-slate-400, relative time ("2 min ago"), hover tooltip for exact
- Row hover: bg-slate-50
- Avatar: 32px, rounded-full, gradient bg with initials if no image
- Pagination: rounded buttons, active has bg-slate-900 text-white

---

### PAGE 8: Settings (app/settings/)

**Current Issues:**
- Technical language ("Token expires", "Webhook ready")
- Plain card layout
- Team section lacks visual hierarchy

**New Layout:**

**Instagram Connection Card:**
- AnimatedCard, p-6
- Header: "Instagram connection" with Instagram icon (colored, 20px)
- Status row:
  - Large indicator: 10px emerald dot (animate-pulse-dot) + "Connected" text
  - Subtitle: "Auto-replies are active" — text-sm text-slate-500
- Account card (inside): rounded-xl, bg-slate-50, p-4, flex items-center gap-4
  - Avatar: 56px, rounded-full
  - Info:
    - @handle: font-medium text-slate-900
    - "Business account" badge: rounded-full, bg-blue-50 text-blue-700 text-xs
    - "Reconnect by {date}" — amber text if < 7 days, slate otherwise
    - "Real-time sync active" with green dot
  - Actions: "Disconnect account" — ghost, rose text on hover
- CTA: GradientButton "+ Connect another account"

**Team Members Card:**
- AnimatedCard, p-6
- Title: "Team members"
- Member list: space-y-3
  - Each: flex items-center gap-3, p-3, rounded-xl, hover:bg-slate-50
  - Avatar: 40px
  - Name: font-medium text-slate-900
  - Email: text-sm text-slate-500
  - Role badge:
    - OWNER: gradient-accent text-white
    - ADMIN: bg-violet-100 text-violet-700
    - MEMBER: bg-slate-100 text-slate-600
  - All badges: rounded-full, px-2.5 py-0.5, text-xs font-medium
- Invite form: flex items-center gap-3 mt-4 pt-4 border-t border-slate-100
  - Email input: SearchInput style, flex-1
  - Role select: shadcn Select, rounded-xl
  - "Send invite" GradientButton primary small

**Account Settings Card:**
- AnimatedCard, p-6
- Title: "Account settings"
- Form fields for workspace name, timezone, etc.
- Danger zone: at bottom of card, border-t border-slate-100 pt-6 mt-6
  - "Delete workspace" — outlined button, rose text, hover:bg-rose-50

---

### PAGE 9: System Status (app/system-status/ or app/diagnostics/) — was Diagnostics

**Current Issues:**
- "Production Diagnostics" too technical
- "Worker", "Queue", "Webhook", "Token" — all developer terms
- "Needs attention" / "No heartbeat found" alarming

**New Layout:**

**Header:**
- Title: "System Status"
- Subtitle: "Check if everything is running smoothly"
- Refresh button: ghost, rounded-xl, RotateCcw icon, hover:bg-slate-50

**Status Banner (if all green):**
- Full width inside content area
- bg-emerald-50, border border-emerald-200, rounded-xl, p-4
- Content: flex items-center gap-3
  - CheckCircle icon, emerald-500, 20px
  - "All systems operational 🎉" — text-emerald-800 font-medium

**Status Cards (2×3 grid, gap-4):**
Use StatCard component:

| Card | Icon | Label | Good | Bad |
|------|------|-------|------|-----|
| API Connection | Wifi | Connection | "Connected" green | "Check connection" orange |
| Message queue | Send | Queue | "All caught up" green | "{n} waiting" amber |
| Processing | Zap | Processing | "Running" green | "Restart needed" rose |
| Scheduled | Clock | Scheduled | "On schedule" green | "{n} delayed" amber |
| Data sync | RefreshCw | Sync | "Up to date" green | "Syncing..." amber |
| Session | Shield | Session | "Valid until {date}" green | "Reconnect soon" amber |

**Detail Cards (stacked, gap-4):**
- "Recent alerts" — was "Recent Worker Alerts"
  - Empty: "No issues — everything's running great! 🎉"
- "Delivery issues" — was "Campaign DM Failures"
  - Empty: "All messages delivered successfully"
- "Connection issues" — was "Webhook Failures"
  - Empty: "Connection is stable"
- "Session health" — was "Token Refresh Failures"
  - Empty: "Session is healthy"

---

### PAGE 10: Landing Page (app/page.tsx or app/(marketing)/page.tsx)

**Current Issues:**
- Very plain, flat, no depth
- Stats (24/7, 1, 0) are just text
- "How it works" section text-heavy
- Feature cards plain bordered boxes
- CTA sections lack visual punch

**New Layout:**

**Hero Section:**
- Background: subtle gradient mesh (CSS-only)
  ```css
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(249,115,22,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.05) 0%, transparent 50%);
  ```
- Content: max-w-7xl mx-auto, px-6, py-20
- Left (60%):
  - Badge: "Open source · Official Meta API" — rounded-full, bg-orange-50 text-orange-700, border border-orange-100, px-3 py-1, text-xs font-medium
  - Headline: "Make every comment start the right message" — text-5xl font-bold tracking-tight
    - "right message" uses GradientText primary
  - Subhead: "Open-sourced ManyChat alternative. When someone comments your keyword on a post or reel, they get your reply a second later. Free, self-hosted, and built on the official Instagram API." — text-lg text-slate-500 max-w-xl mt-6
  - CTAs: flex items-center gap-4 mt-8
    - "Get started" — GradientButton primary large
    - "See how it works" — GradientButton ghost with Play icon
  - Trust bar: flex items-center gap-6 mt-12
    - "24/7 automation" · "Official Meta API" · "Self-hosted" · "Zero fees"
    - Text-sm text-slate-400, dot separators
- Right (40%):
  - Dashboard preview image/card
  - Floating animation (CSS animate-float)
  - Soft shadow-elevated
  - Rounded-3xl
  - Slight rotation on hover (-1deg)

**How It Works Section:**
- Background: white
- Content: max-w-7xl mx-auto, px-6, py-20
- Title: "A comment in, a reply out" — text-3xl font-bold
- Subtitle: "Three steps. Connect an account, build an automation, and let it run." — text-slate-500 mt-2
- 3 steps as cards in row (grid 1 md:3, gap-6):
  1. **Connect** — Link icon, gradient-accent bg (56px circle), white icon
     - Title: "Link your Instagram"
     - Description: "Sign in by email and connect Instagram once. No password sharing, no browser automation."
  2. **Build** — Zap icon, gradient-primary bg (56px circle), white icon
     - Title: "Pick a post, keywords, and reply"
     - Description: "Create an automation for a reel or post: the keyword to watch, the public reply, and the message to send."
  3. **Deliver** — Send icon, gradient-emerald bg (56px circle), white icon
     - Title: "Replies send automatically"
     - Description: "Comments trigger replies instantly through the official API. Every send is queued, rate-limited, and logged."
- Connecting line between cards on desktop: dashed gradient line (absolute positioned)

**Dashboard Preview Section:**
- Background: slate-50
- Content: max-w-7xl mx-auto, px-6, py-20
- Title: "See everything at a glance"
- Description: "Track automations, messages, and growth in one clean dashboard." — text-slate-500
- Image: Rounded-3xl, shadow-elevated, border border-slate-100
- Floating stat badges around image (absolute positioned):
  - "1,284 messages sent" — small AnimatedCard with emerald dot
  - "98% delivery rate" — small AnimatedCard with checkmark

**Features Grid ("Everything, no tiers"):**
- Background: white
- Content: max-w-7xl mx-auto, px-6, py-20
- Title: "Everything you need, no tiers"
- Subtitle: "Self-hosted and open source. You run it, you own it." — text-slate-500
- Grid: 3 cols desktop, 1 mobile, gap-6
- Feature items (no border cards, just icon + text):
  - Icon: 24px, colored (orange, violet, emerald, etc.)
  - Title: text-sm font-semibold text-slate-900
  - Description: text-sm text-slate-500
  - Features:
    - Email & password sign-in
    - Multiple Instagram accounts
    - Encrypted tokens at rest
    - Real-time + polling sync
    - Queue-backed delivery
    - Per-account rate limiting
    - Tracked links with click stats
    - Activity logs with full status
    - No plan limits, fully self-hosted

**Final CTA Section:**
- Background: gradient-primary
- Content: max-w-4xl mx-auto, px-6, py-20, text-center
- Title: "Turn your next reel's comments into messages" — text-4xl font-bold text-white
- Subtitle: "Free and open source. Star it if it saves you a subscription." — text-white/80 mt-4
- Buttons: flex justify-center gap-4 mt-8
  - "Get started" — bg-white text-orange-600 font-medium, rounded-full, h-12 px-8, hover:bg-orange-50
  - "View on GitHub" — border border-white/30 text-white, rounded-full, h-12 px-8, hover:bg-white/10
