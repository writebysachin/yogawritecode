# Tasks — Yoga Write Code

## Status Key
- `[x]` Completed & live in production
- `[~]` In progress
- `[ ]` Not started
- `[!]` Blocked

---

## Phase 1: Foundation ✅
- [x] **Task 1** — Project setup (Next.js + Supabase + Vercel + Bedrock)
- [x] **Task 2** — Database schema (all tables)
- [x] **Task 3** — Auth (Supabase email + Google OAuth via Supabase)

## Phase 2: Core 5-Step Workflow ✅
- [x] **Task 4** — Website analysis (Step 1) — AI analyzes URL
- [x] **Task 5** — Content opportunities (Step 2) — 3-5 scored topics
- [x] **Task 6** — Topic clusters (Step 3) — pillar + supporting topics
- [x] **Task 7** — SEO briefs (Step 4) — keyword, headings, questions
- [x] **Task 8** — Article outlines (Step 5) — H1 + structured sections
- [x] **Task 9** — Drafts & editor — section-by-section writing with AI

## Phase 3: Marketing Site ✅
- [x] **Task 10** — Home page, pricing, about, contact
- [x] **Task 11** — Compare pages (SurferSEO, Frase, Jasper)
- [x] **Task 12** — Solutions pages (agencies, SaaS founders)
- [x] **Task 13** — Resources (blog stub, FAQs)
- [x] **Task 14** — Footer with newsletter subscribe
- [x] **Task 15** — OG image (1200×630 generated via satori)

## Phase 4: Billing ✅
- [x] **Task 16** — Dodo Payments integration (hosted checkout + inline SDK)
- [x] **Task 17** — Webhook handler (subscription activate/cancel/hold/fail)
- [x] **Task 18** — Idempotency (webhook_events table, duplicate prevention)
- [x] **Task 19** — No-card 7-day trial (trial_plan/trial_end in auth metadata)
- [x] **Task 20** — Onboarding wizard (2-step: goal + plan selection)
- [x] **Task 21** — Upgrade page with inline Dodo checkout (CheckoutProvider + CheckoutFrame)
- [x] **Task 22** — Credit system (reserveCredit, refundCredit, logClaim, card bonus)

## Phase 5: Auth & Access ✅
- [x] **Task 23** — Signed-in users auto-redirect to /dashboard from home + login pages
- [x] **Task 24** — Onboarding → paid plan → redirect to /dashboard/upgrade (checkout)
- [x] **Task 25** — canCreateProject() paywall (free tier = 1 project)

## Phase 6: Quality & SEO ✅
- [x] **Task 26** — Readability analysis strips markdown before scoring
- [x] **Task 27** — Draft prompts rewritten (no jargon, plain English, no filler)
- [x] **Task 28** — All AI prompts improved (better quality rules)
- [x] **Task 29** — Website signals cached per BedrockAIProvider instance (no redundant fetches)
- [x] **Task 30** — 7 AI search optimization tricks implemented:
  - HTML sitemap page (`/sitemap-page`)
  - Topical map page (`/ai-content-topics`)
  - AI info page (`/about-for-ai`)
  - Full sitemap.ts (20 routes)
  - robots.ts explicitly allows GPTBot, ClaudeBot, PerplexityBot
  - Richer metadata (publisher, category, twitter.creator)
  - Absolute OG image URLs for social sharing

## Phase 7: Dashboard UX ✅
- [x] **Task 31** — Sidebar redesign: Settings section groups Account, Billing, Upgrade, Docs
- [x] **Task 32** — Analytics page redesign (design tokens, Connected badge, external links)
- [x] **Task 33** — Credits modal redesign (card claim → real checkout flow)
- [x] **Task 34** — Footer: removed giant wordmark, subscribe input under brand tagline

---

## Upcoming / Backlog
- [ ] **Task 35** — Re-enable RLS on all Supabase tables (security tech debt)
- [ ] **Task 36** — Google Search Console data shown in analytics (clicks, impressions per page)
- [ ] **Task 37** — Referral system (refer a founder = 1 free month each)
- [ ] **Task 38** — Blog (actual posts, not stub)
- [ ] **Task 39** — FAQs page (actual content)
- [ ] **Task 40** — Features page (actual content)
- [ ] **Task 41** — Multi-project dashboard improvements
- [ ] **Task 42** — Email sequences (trial ending, out of credits nudge)
- [ ] **Task 43** — SSL cert fix for app.yogawritecode.com (Vercel domain config)
- [ ] **Task 44** — Google OAuth publish (remove Testing mode restriction)
