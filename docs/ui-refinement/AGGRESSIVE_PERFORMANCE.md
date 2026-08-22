# OpenReply — Aggressive Performance Optimization
# Target: Sub-500ms load time. Current: 5-6 seconds.

---

## ROOT CAUSE ANALYSIS (Most Likely Culprits)

The 5-6 second load is NOT just a JS bundle issue. It's likely:
1. **Slow server-side data fetching** — Dashboard queries all data synchronously before sending HTML
2. **No React Suspense boundaries** — Page waits for EVERYTHING before showing anything
3. **Heavy client bundle STILL loaded eagerly** — Recharts, Motion, Lenis on initial chunk
4. **No route loading states** — User sees blank white screen for seconds
5. **Unoptimized images** — Instagram thumbnails loading full resolution
6. **No caching** — Same data fetched on every navigation
7. **Prisma queries without select** — Fetching entire rows when only 3 fields needed

---

## PHASE 1: SERVER-SIDE FIXES (Biggest Impact — Do First)

### 1.1 Add Loading.tsx to EVERY Route

Create `loading.tsx` in EVERY route folder. This shows INSTANTLY while data loads.

```tsx
// app/(dashboard)/dashboard/loading.tsx
import { DashboardSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <DashboardSkeleton />;
}
```

```tsx
// app/(dashboard)/campaigns/loading.tsx
import { CampaignsSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <CampaignsSkeleton />;
}
```

```tsx
// app/(dashboard)/inbox/loading.tsx
import { InboxSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <InboxSkeleton />;
}
```

```tsx
// app/(dashboard)/overview/loading.tsx
import { OverviewSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <OverviewSkeleton />;
}
```

```tsx
// app/(dashboard)/logs/loading.tsx
import { ActivitySkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <ActivitySkeleton />;
}
```

```tsx
// app/(dashboard)/settings/loading.tsx
import { SettingsSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <SettingsSkeleton />;
}
```

```tsx
// app/(dashboard)/diagnostics/loading.tsx
import { DiagnosticsSkeleton } from '@/components/ui-refined/loading-skeleton';
export default function Loading() {
  return <DiagnosticsSkeleton />;
}
```

```tsx
// app/login/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

### 1.2 Wrap Data Fetching in React Suspense

In EVERY page.tsx, wrap data fetching components in Suspense:

```tsx
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/ui-refined/loading-skeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Welcome back 👋" description="..." />

      {/* Stats load first — lightweight */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Charts load separately — heavier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <MessagesChart />
        </Suspense>
        <Suspense fallback={<KeywordsSkeleton />}>
          <TopKeywords />
        </Suspense>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
```

### 1.3 Optimize Prisma Queries (CRITICAL)

Find ALL Prisma queries in the app. Add `select` to ONLY fetch needed fields:

```tsx
// BEFORE — fetches EVERY column
const campaigns = await prisma.campaign.findMany({
  where: { userId: session.user.id },
});

// AFTER — only fetch what's displayed
const campaigns = await prisma.campaign.findMany({
  where: { userId: session.user.id },
  select: {
    id: true,
    name: true,
    status: true,
    keywords: true,
    message: true,
    createdAt: true,
    _count: { select: { dmLogs: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 50, // LIMIT results
});
```

For DM Logs:
```tsx
// BEFORE
const logs = await prisma.dmLog.findMany({
  where: { userId: session.user.id },
  include: { campaign: true, account: true },
});

// AFTER
const logs = await prisma.dmLog.findMany({
  where: { userId: session.user.id },
  select: {
    id: true,
    status: true,
    commentText: true,
    createdAt: true,
    campaign: { select: { name: true } },
    account: { select: { username: true, profilePicture: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 100, // Paginate! Don't load thousands
  skip: (page - 1) * 100,
});
```

For Dashboard stats:
```tsx
// BEFORE — might be doing multiple queries
// AFTER — use aggregate for counts
const stats = await prisma.$transaction([
  prisma.campaign.count({ where: { userId: session.user.id, status: 'ACTIVE' } }),
  prisma.dmLog.count({ where: { userId: session.user.id, status: 'SENT' } }),
  prisma.dmLog.count({ where: { userId: session.user.id, status: 'CLICKED' } }),
]);
```

### 1.4 Add Database Indexes

Check `prisma/schema.prisma` and ensure these indexes exist:

```prisma
model Campaign {
  id        String   @id @default(cuid())
  userId    String
  status    String
  createdAt DateTime @default(now())

  @@index([userId, status])
  @@index([userId, createdAt])
}

model DmLog {
  id        String   @id @default(cuid())
  userId    String
  status    String
  createdAt DateTime @default(now())
  campaignId String?

  @@index([userId, createdAt])
  @@index([userId, status])
  @@index([campaignId])
}

model WebhookEvent {
  id        String   @id @default(cuid())
  userId    String
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

After adding indexes, run:
```bash
npx prisma migrate dev --name add_performance_indexes
```

### 1.5 Cache Dashboard Data

Add caching to dashboard data fetching:

```tsx
import { cache } from 'react';

// Cache dashboard stats for 30 seconds
const getDashboardStats = cache(async (userId: string) => {
  // ... queries
});

// Or use unstable_cache for longer caching
import { unstable_cache } from 'next/cache';

const getCachedStats = unstable_cache(
  async (userId: string) => { /* queries */ },
  ['dashboard-stats'],
  { revalidate: 30 } // 30 seconds
);
```

---

## PHASE 2: CLIENT BUNDLE MASSACRE (Remove Everything Heavy)

### 2.1 Completely Remove Lenis

Lenis is likely causing jank. Remove it ENTIRELY:

```bash
npm uninstall lenis
```

Delete `components/ui-refined/smooth-scroll-provider.tsx`

Remove from `app/layout.tsx`:
```tsx
// REMOVE this:
// import { SmoothScrollProvider } from '@/components/ui-refined/smooth-scroll-provider';
// <SmoothScrollProvider>{children}</SmoothScrollProvider>
// REPLACE with just: {children}
```

Add CSS smooth scroll instead:
```css
html {
  scroll-behavior: smooth;
}
```

### 2.2 Replace ALL Motion with CSS

Motion adds ~40KB+ to bundle. Replace EVERY Motion component with CSS:

```tsx
// BEFORE — in animated-card.tsx
import { motion } from 'motion/react-client';
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

// AFTER — pure CSS
<div className="opacity-0 translate-y-5 animate-fade-in-up">
```

Add to `globals.css`:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.3s ease-out forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
.stagger-children > *:nth-child(6) { animation-delay: 250ms; }
```

Update ALL components:
- `animated-card.tsx` — remove Motion, use CSS classes
- `fade-in.tsx` — remove Motion, use CSS classes  
- `stagger-container.tsx` — remove Motion, use CSS stagger-children class
- `gradient-button.tsx` — remove Motion whileHover/whileTap, use CSS hover:scale-102 active:scale-98

### 2.3 Aggressively Lazy Load Recharts

Create ONE file:
```tsx
// components/charts/chart-registry.tsx
'use client';
import dynamic from 'next/dynamic';

export const LazyAreaChart = dynamic(() => import('recharts').then(m => ({ default: m.AreaChart })), { ssr: false, loading: () => <ChartSkeleton /> });
export const LazyLineChart = dynamic(() => import('recharts').then(m => ({ default: m.LineChart })), { ssr: false, loading: () => <ChartSkeleton /> });
export const LazyBarChart = dynamic(() => import('recharts').then(m => ({ default: m.BarChart })), { ssr: false, loading: () => <ChartSkeleton /> });
export const LazyXAxis = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false });
export const LazyYAxis = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false });
export const LazyCartesianGrid = dynamic(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false });
export const LazyTooltip = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false });
export const LazyResponsiveContainer = dynamic(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false });
export const LazyArea = dynamic(() => import('recharts').then(m => ({ default: m.Area })), { ssr: false });
export const LazyLine = dynamic(() => import('recharts').then(m => ({ default: m.Line })), { ssr: false });
export const LazyBar = dynamic(() => import('recharts').then(m => ({ default: m.Bar })), { ssr: false });
export const LazyCell = dynamic(() => import('recharts').then(m => ({ default: m.Cell })), { ssr: false });
export const LazyLegend = dynamic(() => import('recharts').then(m => ({ default: m.Legend })), { ssr: false });

function ChartSkeleton() {
  return <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse" />;
}
```

Then in chart components:
```tsx
'use client';
import { LazyAreaChart, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip, LazyResponsiveContainer, LazyArea } from '@/components/charts/chart-registry';
```

### 2.4 Remove Auto-Animate If Causing Issues

@formkit/auto-animate can cause re-renders. Check if lists update frequently:
```bash
npm uninstall @formkit/auto-animate
```

Replace with CSS:
```css
.list-animate > * {
  animation: fadeInUp 0.2s ease-out forwards;
}
```

### 2.5 Remove Unused Dependencies

```bash
# Check what's actually used
npx depcheck

# Likely unused after optimization:
npm uninstall lenis @formkit/auto-animate gsap @gsap/react

# If Motion is fully replaced:
npm uninstall motion
```

---

## PHASE 3: IMAGE & ASSET OPTIMIZATION

### 3.1 Optimize Instagram Thumbnails

In campaign cards and post grids:
```tsx
import Image from 'next/image';

// BEFORE — might be using unoptimized img tags
<img src={post.thumbnail} />

// AFTER — Next.js Image with optimization
<Image 
  src={post.thumbnail} 
  alt={post.caption}
  width={80}
  height={80}
  className="rounded-xl object-cover"
  loading="lazy"
  quality={75}
/>
```

### 3.2 Add Image Domains to next.config.js

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.cdninstagram.com' },
    { protocol: 'https', hostname: '**.fbcdn.net' },
    { protocol: 'https', hostname: 'scontent-**.**' },
  ],
},
```

---

## PHASE 4: NEXT.JS CONFIG OPTIMIZATION

Update `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    // Enable partial prerendering for faster initial loads
    ppr: true,
  },

  // Bundle analyzer (only when ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server' }));
      return config;
    },
  }),
};

module.exports = nextConfig;
```

---

## PHASE 5: COMPONENT MEMOIZATION & RENDER OPTIMIZATION

### 5.1 Memoize ALL Reusable Components

```tsx
// components/ui-refined/stat-card.tsx
import { memo } from 'react';

export const StatCard = memo(function StatCard({ title, value, icon, accent, change }: StatCardProps) {
  // existing code
}, (prev, next) => {
  return prev.value === next.value && prev.title === next.title;
});
```

Do this for: StatCard, GradientButton, StatusBadge, Avatar, AnimatedCard, SearchInput.

### 5.2 Use useMemo for Expensive Computations

```tsx
// In dashboard page
import { useMemo } from 'react';

const chartData = useMemo(() => {
  return messages.map(m => ({ date: m.date, count: m.count }));
}, [messages]);

const topKeywords = useMemo(() => {
  return keywords.sort((a, b) => b.count - a.count).slice(0, 10);
}, [keywords]);
```

### 5.3 Use useCallback for Event Handlers

```tsx
const handleSearch = useCallback((value: string) => {
  setSearchQuery(value);
}, []);

const handleToggle = useCallback((id: string) => {
  toggleAutomation(id);
}, []);
```

---

## PHASE 6: ROUTE-LEVEL CODE SPLITTING

### 6.1 Lazy Load Entire Page Sections

For Dashboard, split into separate async components:

```tsx
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';

// These components fetch their OWN data
import { DashboardStats } from './_components/dashboard-stats';
import { MessagesChart } from './_components/messages-chart';
import { TopKeywords } from './_components/top-keywords';
import { RecentActivity } from './_components/recent-activity';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <MessagesChart />
        </Suspense>
        <Suspense fallback={<KeywordsSkeleton />}>
          <TopKeywords />
        </Suspense>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
```

### 6.2 Create Proper Skeleton Components

```tsx
// components/ui-refined/loading-skeleton.tsx
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="mt-3 h-8 w-20 bg-slate-100 rounded animate-pulse" />
          <div className="mt-1 h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="h-[300px] rounded-2xl bg-white border border-slate-100 p-4"><div className="h-full bg-slate-100 rounded-xl animate-pulse" /></div>;
}

export function KeywordsSkeleton() {
  return <div className="h-[300px] rounded-2xl bg-white border border-slate-100 p-4"><div className="h-full bg-slate-100 rounded-xl animate-pulse" /></div>;
}

export function ActivitySkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## PHASE 7: VERIFICATION

After ALL fixes, run:

```bash
# Clean build
rm -rf .next
npm run build

# Check bundle sizes
ls -lah .next/static/chunks/
# Main should be < 100KB
# Pages should each have their own small chunk

# Check for Recharts in non-chart pages
grep -r "recharts" .next/static/chunks/pages/ --exclude="*chart*" --exclude="*overview*" --exclude="*dashboard*" --exclude="*diagnostics*"
# Should return NOTHING

# Start dev and test
npm run dev
```

Open DevTools → Network → check:
- First Contentful Paint < 500ms
- Largest Contentful Paint < 1s
- No 5+ second blocking requests
- JS chunks are small (< 100KB each)
