# OpenReply Performance Optimization — Complete Speed Audit & Fix

> **Goal:** Reduce page load time from 5-6 seconds to under 0.5 seconds.
> **Root causes likely are:** Heavy animation libraries loaded eagerly, Recharts bundled on every page, unused components imported, no code splitting, Lenis running on all pages, large bundle size.

---

## STEP 1: DIAGNOSE — Run These Commands First

```bash
# Check bundle size
npm run build

# Analyze bundle (install if needed)
npm install -D @next/bundle-analyzer
# Add to next.config.js: const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
# Then run: ANALYZE=true npm run build

# Check for unused exports/imports
npx unimported

# Check for circular dependencies
npx madge --circular app/
```

Report the output of these commands before proceeding.

---

## STEP 2: CRITICAL FIXES — Do These First (Biggest Impact)

### 2.1 Lazy Load Recharts (HEAVIEST component)

Recharts adds ~150KB+ to bundle. It must NOT load on pages without charts.

For EVERY page using charts (Dashboard, Insights, System Status):
```tsx
import dynamic from 'next/dynamic';

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
// Lazy load all recharts components individually
```

OR create a wrapper:
```tsx
// components/charts/lazy-charts.tsx
'use client';
import dynamic from 'next/dynamic';

export const LazyAreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse" /> });
export const LazyLineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse" /> });
// ... export all chart components used
```

Replace ALL direct `import { AreaChart } from 'recharts'` with lazy imports.

### 2.2 Remove Unused Libraries

Check if GSAP is actually used anywhere:
```bash
grep -r "gsap" app/ components/ --include="*.tsx" --include="*.ts"
```

If GSAP is NOT used in any page/component:
```bash
npm uninstall gsap @gsap/react
```

If GSAP IS used only in 1-2 places, lazy load it:
```tsx
const gsap = dynamic(() => import('gsap').then(m => m.gsap), { ssr: false });
```

### 2.3 Fix Lenis Smooth Scroll

Lenis can cause jank and slow initial paint. Optimize:

```tsx
// components/ui-refined/smooth-scroll-provider.tsx
'use client';
import { ReactNode, useEffect, useState } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<any>(null);

  useEffect(() => {
    // Only initialize Lenis after initial paint
    const timer = setTimeout(() => {
      import('lenis').then((LenisModule) => {
        const Lenis = LenisModule.default;
        const instance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        function raf(time: number) {
          instance.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        setLenis(instance);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (lenis) lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### 2.4 Optimize Motion (Framer Motion) Imports

Motion can be heavy. Use granular imports:

```tsx
// BAD — imports entire motion library
import { motion } from 'motion';

// GOOD — import only what you need
import * as motion from 'motion/react-client';
// OR for specific components
import { motion } from 'framer-motion';
```

For simple animations, replace Motion with CSS:
```css
/* Instead of Motion fade-in */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
```

Replace ALL simple fade/slide animations in lists and cards with CSS animations. Only use Motion for:
- Complex gesture interactions
- AnimatePresence (page transitions)
- Layout animations
- Hover/tap interactions that need JS

### 2.5 Lazy Load Heavy Page Sections

For Dashboard, Insights, and any page with charts:
```tsx
import dynamic from 'next/dynamic';

const MessagesChart = dynamic(() => import('@/components/dashboard/messages-chart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse" />
});

const TopKeywords = dynamic(() => import('@/components/dashboard/top-keywords'), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 rounded-xl animate-pulse" />
});
```

### 2.6 Remove Auto-Animate If Causing Jank

@formkit/auto-animate can cause re-render loops. Check if lists are animating too frequently:
```tsx
// If causing issues, replace with CSS:
// Add to globals.css:
.list-animate > * {
  animation: fadeInUp 0.2s ease-out forwards;
}
```

If auto-animate is fine, keep it but ensure it's only on stable lists (not rapidly updating ones like Activity feed).

---

## STEP 3: BUNDLE OPTIMIZATION

### 3.1 next.config.js Optimizations

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-icons',
    ],
  },

  // Compress output
  compress: true,

  // Disable powered by header
  poweredByHeader: false,

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
```

### 3.2 Optimize Font Loading

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Critical: prevents FOIT
  preload: true,
  adjustFontFallback: true,
});
```

### 3.3 Remove Unused CSS

Check if Tailwind is purging correctly. In `tailwind.config.ts`:
```typescript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Remove any paths that don't exist
  ],
};
```

### 3.4 Tree Shake Lucide Icons

Import icons individually, NEVER import the whole library:
```tsx
// BAD
import { Icons } from 'lucide-react';

// GOOD
import { LayoutDashboard, BarChart3, MessageCircle, Zap, Activity, Settings, HeartPulse } from 'lucide-react';
```

Check for any `import * as Icons from 'lucide-react'` and fix immediately.

---

## STEP 4: COMPONENT-LEVEL OPTIMIZATIONS

### 4.1 Memoize Expensive Components

```tsx
import { memo } from 'react';

const StatCard = memo(function StatCard({ title, value, icon, accent }: StatCardProps) {
  // component body
});
```

Memoize: StatCard, AnimatedCard, StatusBadge, GradientButton, Avatar.

### 4.2 Optimize AnimatedCard

```tsx
'use client';
import { motion } from 'motion/react-client'; // lighter import
import { ReactNode, memo } from 'react';

export const AnimatedCard = memo(function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hover = true 
}: AnimatedCardProps) {
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
});
```

### 4.3 Virtualize Long Lists

For Activity page and Messages list with 100+ items:
```bash
npm install react-window
```

```tsx
import { FixedSizeList as List } from 'react-window';

// Use for DM logs table and conversation list when items > 50
```

### 4.4 Debounce Search Inputs

```tsx
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce((value: string) => {
    setSearchQuery(value);
  }, 300),
  []
);
```

### 4.5 Optimize Sidebar

```tsx
// app-sidebar.tsx — wrap in memo
import { memo } from 'react';

const AppSidebar = memo(function AppSidebar() {
  // Don't re-render on every page change
});
```

---

## STEP 5: PAGE-SPECIFIC FIXES

### 5.1 Dashboard Page

```tsx
// app/dashboard/page.tsx
import dynamic from 'next/dynamic';

// Lazy load chart sections
const MessagesChart = dynamic(() => import('@/components/dashboard/messages-chart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
});

const TopKeywordsChart = dynamic(() => import('@/components/dashboard/top-keywords-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// Use CSS animations instead of Motion for stat cards
// Use will-change sparingly
```

### 5.2 Landing Page

```tsx
// Lazy load below-the-fold sections
const HowItWorks = dynamic(() => import('@/components/landing/how-it-works'));
const FeaturesGrid = dynamic(() => import('@/components/landing/features-grid'));
const FinalCTA = dynamic(() => import('@/components/landing/final-cta'));
```

### 5.3 Auth Page

- Remove ALL animations from auth page (not needed)
- Use static CSS only
- Remove Lenis from auth page if possible

---

## STEP 6: CSS OPTIMIZATION

### 6.1 Reduce CSS Bundle

In `globals.css`, remove unused keyframes and utilities. Only keep:
- `.gradient-primary`
- `.gradient-accent`
- `.text-gradient`
- `@keyframes float`
- `@keyframes pulse-dot`
- `@keyframes fadeInUp` (if replacing Motion)
- Custom scrollbar

Remove any experimental or unused CSS.

### 6.2 Use CSS Containment

```css
.card-container {
  contain: layout style paint;
}
```

### 6.3 Reduce Motion for Performance

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## STEP 7: VERIFICATION COMMANDS

After all fixes, run:

```bash
# Build and check size
npm run build

# Check bundle size
ls -la .next/static/chunks/

# Lighthouse score (if available)
npx lighthouse http://localhost:3000 --output=json

# Check for console warnings
npm run dev
# Open browser, check console for:
# - "Warning: useLayoutEffect does nothing on server"
# - "Extra attributes from the server"
# - Any React warnings
```

---

## STEP 8: PERFORMANCE TARGETS

| Metric | Before | Target | How to Check |
|--------|--------|--------|--------------|
| First Contentful Paint | 5-6s | <0.5s | Lighthouse |
| Largest Contentful Paint | 5-6s | <1.0s | Lighthouse |
| Time to Interactive | 5-6s | <1.5s | Lighthouse |
| Bundle size (main) | ? | <200KB | `ls -la .next/static/chunks/main*.js` |
| Bundle size (pages) | ? | <100KB each | `ls -la .next/static/chunks/pages/` |
| Recharts chunk | Loaded everywhere | Only on chart pages | Bundle analyzer |

---

## CRITICAL RULES

1. NEVER remove functionality — only optimize HOW it loads
2. NEVER break existing API calls or data fetching
3. ALWAYS lazy load Recharts — it's the #1 cause of slow loads
4. ALWAYS check `npm run build` passes after each change
5. ALWAYS test the page that was slowest FIRST (probably Dashboard)
6. If a library is unused, uninstall it (GSAP, maybe Lenis)
7. Use CSS animations over JS animations where possible
8. Memoize all reusable components
