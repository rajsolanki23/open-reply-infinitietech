# OpenReply UI/UX Refinement — Design System & Installation

> **Purpose:** This file defines the complete visual language, color palette, typography, spacing, shadows, animation specs, and installation steps. The agent must read this first and apply every token exactly.

---

## 1. Philosophy

- **Light mode ONLY.** Warm, energetic, creator-friendly. No dark mode anywhere.
- Every surface should feel "alive" — subtle motion, soft shadows, gradient accents.
- No harsh blacks. No technical jargon in UI copy.
- **Mobile-first responsive.** Touch targets minimum 44px.
- **ManyChat-inspired:** Bright whites, vibrant orange-to-coral gradient CTAs, generous whitespace, rounded-2xl everything, smooth scroll-triggered reveals.
- **Creator-first language:** A non-technical Instagram creator must understand every label in 2 seconds.

---

## 2. Color Palette

### Primary Action (Orange Gradient)
```css
--gradient-primary: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
--gradient-primary-hover: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
```
- **Use for:** Primary buttons, active nav indicators, key CTAs, main actions.
- **Tailwind:** `bg-gradient-to-br from-orange-500 to-orange-400`

### Secondary / Accent (Violet-to-Pink Gradient)
```css
--gradient-accent: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
```
- **Use for:** Charts, decorative elements, secondary buttons, accent badges, team owner badges.
- **Tailwind:** `bg-gradient-to-br from-violet-500 to-pink-500`

### Success
- `emerald-500` (#10b981)
- Light: `emerald-50` background + `emerald-600` text
- **Use for:** Delivered status, connected states, positive trends.

### Warning
- `amber-500` (#f59e0b)
- Light: `amber-50` background
- **Use for:** Paused states, scheduled items, slowing down.

### Attention (Replaces "Error")
- `rose-500` (#f43f5e)
- Light: `rose-50` background
- **Use for:** Needs retry, check connection, didn't send.
- **NEVER say "Failed" or "Error" in UI.**

### Backgrounds
| Token | Value | Tailwind |
|-------|-------|----------|
| Page bg | #ffffff | `white` |
| Section alt | #f8fafc | `slate-50` |
| Card bg | #ffffff | `white` |
| Hover bg | #f8fafc | `slate-50` |

### Text
| Token | Value | Tailwind |
|-------|-------|----------|
| Primary | #0f172a | `slate-900` |
| Secondary | #64748b | `slate-500` |
| Muted | #94a3b8 | `slate-400` |
| Inverse | #ffffff | `white` |

### Borders
| Token | Value | Tailwind |
|-------|-------|----------|
| Default | #f1f5f9 | `slate-100` |
| Hover | #e2e8f0 | `slate-200` |
| Focus | #fb923c | `orange-400` |

---

## 3. Typography

- **Font:** Inter (import from `next/font/google`)
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700 (hero)

| Element | Size | Weight | Tracking | Color |
|---------|------|--------|----------|-------|
| Hero title | text-4xl md:text-5xl | font-bold | tracking-tight | slate-900 |
| Section title | text-2xl | font-semibold | — | slate-900 |
| Card title | text-lg | font-semibold | — | slate-900 |
| Body | text-sm | font-normal | — | slate-500 |
| Label | text-xs | font-medium | uppercase tracking-wider | slate-400 |
| Stat value | text-2xl | font-bold | — | slate-900 |
| Button | text-sm | font-medium | — | white or slate-700 |

---

## 4. Spacing & Shape

| Element | Value |
|---------|-------|
| Cards | rounded-2xl (16px), padding p-6 |
| Buttons standard | rounded-xl (12px), height h-11, px-6 |
| Buttons floating/CTA | rounded-full, height h-12, px-8 |
| Inputs | rounded-xl, height h-11, border-slate-200 |
| Badges | rounded-full, px-2.5 py-0.5, text-xs font-medium |
| Avatars small | 32px, rounded-full |
| Avatars medium | 40px, rounded-full |
| Avatars large | 56px, rounded-full |
| Sidebar width | 240px desktop, collapsible to 72px |
| Top header height | 64px |
| Page max-width | 1280px (max-w-7xl), centered |
| Section gap | gap-6 between cards, py-6 between sections |

---

## 5. Shadows

| Name | Value | Tailwind Custom |
|------|-------|-----------------|
| Card default | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)` | `shadow-card` |
| Card hover | `0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)` | `shadow-card-hover` |
| Elevated | `0 12px 40px rgba(0,0,0,0.1)` | `shadow-elevated` |
| Glow (CTA) | `0 4px 20px rgba(249,115,22,0.3)` | `shadow-glow` |

---

## 6. Animation Specs

| Animation | Spec |
|-----------|------|
| Card hover lift | `translateY(-2px)` + shadow-card-hover, 200ms ease-out |
| Button hover | `scale(1.02)`, 150ms ease-out |
| Button press | `scale(0.98)`, 100ms |
| Page entrance | fade `opacity 0→1` + slide up `y: 20px→0`, 300ms ease-out |
| Stagger children | 50ms delay between each child item |
| List item entrance | fade + slide right 10px, 200ms |
| Skeleton loading | pulse animation, bg-slate-100 |
| Toast entrance | slide in from right, 400ms ease-out |
| Toast exit | fade out, 200ms |
| Modal/sheet | fade backdrop + slide up content, 300ms |
| Sidebar collapse | width transition 300ms ease-in-out |
| Floating decorative | CSS keyframes `translateY(0→-12px→0)`, 4s infinite ease-in-out |
| Status dot pulse | `scale(1→1.3→1)`, 2s infinite |

**Reduced motion:** Wrap all animations in `prefers-reduced-motion` check. If user prefers reduced motion, disable all transforms and use instant opacity changes only.

---

## 7. Installation Commands

Run these EXACT commands in order. Stop and report if any fail:

```bash
# Core animation libraries
npm install motion gsap @gsap/react lenis

# UI utilities
npm install @formkit/auto-animate recharts lucide-react

# shadcn/ui components (all at once)
npx shadcn@latest add button card input textarea badge avatar separator skeleton dialog dropdown-menu sheet tooltip hover-card table sonner command tabs progress switch select popover
```

---

## 8. Tailwind Config Updates

Update `tailwind.config.ts` with these exact additions:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'elevated': '0 12px 40px rgba(0,0,0,0.1)',
        'glow': '0 4px 20px rgba(249,115,22,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
};

export default config;
```

---

## 9. Global CSS Updates

Add to `app/globals.css`:

```css
@layer base {
  body {
    @apply bg-white text-slate-900 antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

@layer utilities {
  .gradient-primary {
    @apply bg-gradient-to-br from-orange-500 to-orange-400;
  }
  .gradient-accent {
    @apply bg-gradient-to-br from-violet-500 to-pink-500;
  }
  .gradient-emerald {
    @apply bg-gradient-to-br from-emerald-400 to-emerald-600;
  }
  .text-gradient {
    @apply bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent;
  }
  .text-gradient-accent {
    @apply bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent;
  }
}

/* Floating animation for decorative elements */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Pulse dot for live indicators */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
.animate-pulse-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}
```

---

## 10. Layout Setup (app/layout.tsx)

Update `app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { SmoothScrollProvider } from '@/components/ui-refined/smooth-scroll-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: "rounded-xl border border-slate-100 shadow-elevated",
          }}
        />
      </body>
    </html>
  );
}
```

Create `components/ui-refined/smooth-scroll-provider.tsx`:
```tsx
'use client';
import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```
