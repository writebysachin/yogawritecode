# Product Requirements Document — Yoga Write Code (YWC)

_Last updated: 2026-11-02_

---

## 1. Product Overview

- **Product name:** Yoga Write Code (YWC)
- **Tagline:** AI content operating system for SaaS companies.
- **One-line:** Paste a website URL — get content opportunities, topic clusters, SEO briefs, and article outlines grounded in your actual business.
- **Stage:** Live in production at yogawritecode.com / app.yogawritecode.com
- **Problem:** Content creators waste hours on research, topic planning, and brief writing. Most SEO tools give data but not structure or workflow.
- **Solution:** A guided 5-step AI workflow that turns any website into a complete content plan — from analysis to publishable draft.

---

## 2. Target Users

| Segment | Description |
|---|---|
| Solo bloggers | Writing about their own site, want consistent output |
| SaaS founders | Need content marketing but no dedicated team |
| Content agencies | Managing multiple clients, need repeatable process |
| Freelance writers | Want AI-assisted briefs and outlines |

---

## 3. Plans & Pricing

| Plan | Price | Credits | Projects | Key Features |
|---|---|---|---|---|
| Free | $0 | 50 credits | 1 | Full 5-step workflow, view-only exports |
| Starter | $9/mo · $86/yr | 200/mo | 3 | Markdown + PDF export |
| Pro Writer | $19/mo · $182/yr | Unlimited | Unlimited | All exports, priority AI, 7-day trial |
| Scale | $40/mo · $384/yr | Unlimited | Unlimited | Client exports, bulk briefs, support |

- **Trial:** 7-day free trial on all paid plans — no card required at signup
- **Card bonus:** +100 credits for adding a payment method (goes through Dodo checkout)
- **Billing:** Dodo Payments (not Stripe)

---

## 4. Core 5-Step Workflow

```
Step 1: Analyze Website
  → Scrape URL signals, AI returns company summary, category, audience, positioning
  → Saves to: website_analyses + content_opportunities

Step 2: Content Opportunities
  → 3-5 scored topics with intent, difficulty, funnel stage, keywords
  → Saves to: content_opportunities

Step 3: Topic Cluster
  → Pillar + supporting topics + internal linking suggestions
  → Saves to: topic_clusters

Step 4: SEO Brief
  → Primary keyword, headings, questions, entities, competitor insights
  → Saves to: seo_briefs

Step 5: Article Outline
  → H1 + 5-8 sections with purpose + bullet points
  → Saves to: article_outlines

Editor:
  → Draft each section with AI or write manually
  → Readability score (Flesch-Kincaid, strips markdown)
  → SEO score (6 checks)
  → Export: Markdown, HTML, PDF
```

---

## 5. User Flows

### New user (marketing → signup)
1. Lands on `yogawritecode.com` (if signed in → redirect to /dashboard)
2. Clicks pricing CTA → `/login?plan=pro&cycle=monthly`
3. Signs up → email confirmation → `/onboarding`
4. Onboarding: picks goal + plan → `completeOnboarding()`
5. Free plan → `/dashboard`
6. Paid plan → `/dashboard/upgrade?plan=pro&cycle=monthly&autostart=1` → Dodo checkout auto-opens
7. Payment → `/dashboard/payment-success` → webhook activates account

### Returning user
1. Visits `yogawritecode.com` or `/login` → auto-redirect to `/dashboard`

### Credit claim
1. Clicks "N credits" button in header
2. Modal opens → "Add card to claim 100 credits"
3. Clicks → goes to `/dashboard/upgrade?autostart=1` → Dodo checkout
4. After payment → webhook fires → account activates + credits flow from plan

---

## 6. Technical Architecture

### AI Pipeline
```
URL → extractWebsiteSignals() [5s timeout, cached per provider instance]
    → prompt builder (lib/ai/prompts.ts)
    → AWS Bedrock (Claude Sonnet, ap-southeast-2)
    → Zod schema validation (2 retries)
    → Supabase insert
```

### Billing Pipeline
```
User selects plan → /api/checkout (creates Dodo session)
    → Dodo inline checkout (dodopayments-checkout SDK)
    → Payment success → /dashboard/payment-success
    → Dodo webhook → /api/webhooks/dodo
    → Signature verification (standardwebhooks)
    → Idempotency check (webhook_events table)
    → profiles.subscription_status = "active"
```

### Auth
- Email/password via Supabase
- Google OAuth via Supabase (for user sign-in)
- Google OAuth via custom flow (for Search Console integration)
- All protected routes: server-side `supabase.auth.getUser()` check

---

## 7. Database Tables

| Table | Purpose |
|---|---|
| profiles | User profile, subscription_status, ai_credits_balance, card_bonus_claimed |
| projects | name, website_url, user_id |
| website_analyses | company_summary, target_audience, product_category |
| content_opportunities | title, score, difficulty, intent, keywords, keyword_gaps |
| topic_clusters | pillar_topic, supporting_topics, internal_linking_suggestions |
| seo_briefs | primary_keyword, headings, questions, entities |
| article_outlines | h1, sections (JSON) |
| article_drafts | title, content (JSON sections) |
| credit_ledger | delta, reason, step, model, balance_after |
| webhook_events | event_id (unique — idempotency) |
| google_connections | google_email, refresh_token_enc |

---

## 8. Marketing Site Pages

| Page | Purpose |
|---|---|
| `/` | Home — hero, workflow, features, FAQ |
| `/pricing` | Plan comparison |
| `/about` | Founder story |
| `/features` | Feature deep-dive (stub → needs content) |
| `/solutions` | Overview (stub → needs content) |
| `/solutions/agencies` | Agency use case (stub) |
| `/compare` | Competitor hub |
| `/compare/surfer-seo` | vs SurferSEO |
| `/compare/frase` | vs Frase |
| `/compare/jasper` | vs Jasper |
| `/resources/blog` | Blog (stub → needs posts) |
| `/resources/faqs` | FAQs (stub → needs content) |
| `/contact` | Contact form |
| `/sitemap-page` | HTML sitemap for AI crawlers |
| `/ai-content-topics` | Topical authority map |
| `/about-for-ai` | Structured reference for AI/LLMs |

---

## 9. Non-Functional Requirements

| Requirement | Target | Status |
|---|---|---|
| AI response time | < 45s per step | ✅ 45s timeout set |
| Page load | < 2s | ✅ Vercel edge |
| Webhook security | Signature verified | ✅ standardwebhooks |
| Webhook idempotency | No duplicate activations | ✅ webhook_events table |
| No secrets in client | All keys server-only | ✅ |
| OG image | Absolute URL for social sharing | ✅ |
| AI content tone | Plain English, no jargon | ✅ prompt rewrite Nov 2026 |
| RLS | Row-level security on all tables | ⚠️ disabled (tech debt) |

---

## 10. Out of Scope (for now)
- Multi-user teams / workspaces
- Real-time collaboration
- GA4 / Search Console data in dashboard (connection exists, data display TBD)
- Native mobile app
- Custom AI model fine-tuning
- White-label / agency reseller
