# OpenReply UI/UX Refinement — Naming Convention Overhaul

> **Purpose:** Every label, title, status, and button must pass the "Creator Test" — a non-technical Instagram creator must understand it in 2 seconds. This file is the absolute source of truth for ALL text changes.

---

## Rule: Creator-First Language

**NEVER use these words in user-facing UI:**
- Failed, Error, Broken, Dead, Crash
- Webhook, Token, Queue, Worker, Heartbeat, OAuth, Redirect URI, Graph API
- DM (use "Message" or "messages" instead)
- Logs (use "Activity" or "History")
- Campaign (use "Automation")
- Production, Diagnostics (use "System Status")
- ALL CAPS labels (use sentence case)

---

## 1. Navigation Labels (Sidebar)

| Old Label | New Label | Icon (Lucide) |
|-----------|-----------|---------------|
| Dashboard | Dashboard | LayoutDashboard |
| Overview | Insights | BarChart3 |
| Inbox | Messages | MessageCircle |
| Campaigns | Automations | Zap |
| DM Logs | Activity | Activity |
| Settings | Settings | Settings |
| Diagnostics | System Status | HeartPulse |

**Sidebar active state:**
- Left border: 3px gradient-primary
- Background: bg-orange-50/50
- Text: text-orange-700 font-medium
- Icon: text-orange-500

**Sidebar inactive state:**
- Text: text-slate-500
- Hover: bg-slate-50, text-slate-900

---

## 2. Page Titles & Headers

| Old | New |
|-----|-----|
| Production Diagnostics | System Status |
| Hello, {email}! | Welcome back 👋 |
| 1 connected account · 3 contacts | 1 account connected · 3 people reached |
| See activity | View all activity |
| New Campaign | Create Automation |
| Campaign for @{handle} | @{handle} — Auto-reply |
| DM Logs | Recent Activity |
| Overview | Insights |
| Diagnostics | System Status |
| Production Diagnostics | System Health |

---

## 3. Feature / Field Labels

| Old | New | Notes |
|-----|-----|-------|
| Campaign name (optional) | Automation Name | Remove "(optional)" — encourage naming |
| When someone comments on | When someone comments on... | Keep but style as label |
| a specific post or reel | Choose a post or reel | Clear action |
| any post or reel | Any of my posts | Conversational |
| next post or reel | My next post | Simpler |
| And this comment has | Reply when comment contains | Active voice |
| a specific word or words | These keywords | Direct |
| Follow gate | Require follow to unlock | Self-explanatory |
| Copy URL | Copy link | Clearer purpose |
| Go Live | Publish automation | Less scary, more accurate |
| Webhook ready | Real-time sync active | Benefit-oriented |
| Token expires {date} | Reconnect by {date} | Action-oriented |
| Comment webhooks and private replies depend on this connection | Auto-replies need this connection | Plain English |
| 24/7 Comment monitoring | Always on | Simpler |
| DM per matched comment | Reply per comment | No "DM" |
| Scraping required | No scraping needed | Positive framing |

---

## 4. Status Labels (CRITICAL — Remove ALL Negative Language)

| Old Status | New Status | Badge Style |
|------------|------------|-------------|
| Failed | Needs retry | rose bg, rose text |
| Failed (stat card) | Needs attention | rose bg, rose text |
| Skipped | Filtered out | amber bg, amber text |
| Sent | Delivered ✓ | emerald bg, emerald text |
| Pending | Sending... | amber bg, amber text + pulse animation |
| RATE LIMIT | Slowing down | amber bg, amber text |
| PLAN LIMIT | — | **REMOVE THIS TAB ENTIRELY** (self-hosted has no plan limits) |
| DEDUP | Already replied | slate bg, slate text |
| Needs attention (worker) | Check connection | orange text |
| No heartbeat found | Waiting for connection | slate text |
| Active | Active | emerald bg, emerald text |
| Paused | Paused | amber bg, amber text |

---

## 5. Button Labels

| Old | New | Case Rule |
|-----|-----|-----------|
| Get started | Get started | Sentence case |
| See how it works | See how it works | Sentence case |
| Create Account | Create account | Sentence case |
| Sign In | Sign in | Sentence case |
| Sign Out | Sign out | Sentence case |
| Go Live | Publish | Sentence case |
| Import | Import | Sentence case |
| Copy URL | Copy link | Sentence case |
| Disconnect | Disconnect account | Sentence case |
| Connect another account | + Connect another account | Sentence case |
| Invite | Send invite | Sentence case |
| Refresh | Refresh data | Sentence case |
| Go Live (top right) | Publish automation | Sentence case |

---

## 6. Empty States (Positive Framing ONLY)

| Old | New |
|-----|-----|
| No worker alerts recorded | All systems running smoothly 🎉 |
| No DM failures or skips | All messages delivered successfully |
| No failed webhook events | Connection is stable |
| No token refresh failures | Session is healthy |
| No campaigns yet | No automations yet |
| No messages | No messages yet — they'll appear here |
| No activity | No activity yet — create your first automation |

---

## 7. Error / Warning Messages (Softened)

| Old | New |
|-----|-----|
| Insufficient Developer Role | Invite pending — check your Instagram app |
| Unsupported request | Connection error — try reconnecting |
| Redirect URI mismatch | App settings need updating |
| Insufficient permissions | Account needs reconnecting |
| Rate limit exceeded | Slowing down to stay within limits |

---

## 8. Stats / Metrics Labels

| Old | New |
|-----|-----|
| Active Campaigns | Active automations |
| DMs Sent | Messages sent |
| Skipped | Filtered out |
| Failed | Needs retry |
| Clicks | Link clicks |
| CTR | Click-through rate |
| Queue Waiting | Waiting to send |
| Queue Active | Sending now |
| Queue Delayed | Scheduled |
| Queue Failed | Needs retry |
| Worker Health | API Connection |
| 24/7 | Always on |
| DM per matched comment | Reply per comment |
| Scraping required | No scraping needed |

---

## 9. Section Labels

| Old | New |
|-----|-----|
| HOW IT WORKS | How it works |
| THE DASHBOARD | Your dashboard |
| WHAT'S INCLUDED | What's included |
| Recent Worker Alerts | Recent alerts |
| Campaign DM Failures And Skips | Delivery issues |
| Webhook Failures | Connection issues |
| Token Refresh Failures | Session health |
| Instagram Connection | Instagram connection |
| Team | Team members |

---

## 10. Form Labels (Auth Page)

| Old | New |
|-----|-----|
| FULL NAME (OPTIONAL) | Full name |
| EMAIL ADDRESS | Email |
| PASSWORD | Password |
| CONFIRM PASSWORD | Confirm password |
| Your Name | Your name |
| you@company.com | you@example.com |
| At least 6 characters | At least 6 characters |

---

## 11. Quick Reference: Words to BAN from UI

**BANNED:**
- Failed, Error, Crash, Broken, Dead
- Webhook, Token, Queue, Worker, Heartbeat
- OAuth, Redirect URI, Graph API, Client ID
- DM (except in "DM Logs" → change to "Activity")
- Logs (change to "Activity" or "History")
- Campaign (change to "Automation")
- Production, Diagnostics (change to "System Status")
- ALL CAPS labels
- Technical abbreviations (API, URI, CTR is okay if explained)

**ALLOWED:**
- Message, messages, reply, replies
- Automation, automations
- Activity, history
- Connection, sync
- Delivered, sending, retry
- Insights, dashboard
