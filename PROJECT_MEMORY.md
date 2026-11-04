# Project Memory — Yoga Write Code

## 1. Project Context
- **Product name:** Yoga Write Code (YWC)
- **Stage:** Live in production — billing, onboarding, and full 5-step workflow complete
- **Domain:** yogawritecode.com (marketing) · app.yogawritecode.com (dashboard)
- **GitHub:** github.com/writebysachin/yogawritecode
- **Vercel project:** yoga-write-code
- **Supabase project:** vxlotiguntktnxlxvkdo
- **Stack:** Next.js (App Router), Supabase, AWS Bedrock (Claude), Dodo Payments, Vercel, Resend

---

## 2. Architecture Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-09-19 | Disable RLS on all tables | Server actions were blocked from writing during dev |
| 2026-09-19 | Use raw HTML `<form>` for AI steps | Custom GenerateButton silently failed to pass formData |
| 2026-09-19 | Bulletproof JSON parser in bedrock.ts | AI returns markdown + chatty text, JSON.parse was failing |
| 2026-09-26 | `lib/site.ts` as single source of truth for site URL | URL was hardcoded in 6 places |
| 2026-09-26 | `app/opengraph-image.tsx` as site-wide OG image (1200×630) | Homepage had no real OG image |
| 2026-10-01 | Dodo Payments for billing (not Stripe) | Better global coverage, simpler hosted checkout |
| 2026-10-15 | No-card 7-day trial via auth metadata | Reduces onboarding friction — trial_plan/trial_end in user_metadata |
| 2026-11-01 | Billing columns on profiles table | subscription_status, dodo_subscription_id, ai_credits_balance, card_bonus_claimed |
| 2026-11-01 | webhook_events table for idempotency | Prevents duplicate activations on webhook retries |
| 2026-11-02 | BedrockAIProvider signals cache | Website fetched once per provider instance, not once per workflow step |
| 2026-11-02 | `/checkout` page deleted | Was a public marketing page — all payments now go through /dashboard/upgrade |
| 2026-11-02 | Absolute OG image URLs | LinkedIn/Facebook/Slack require absolute URLs, relative paths don't work |
| 2026-11-04 | Bedrock API key rotated to `52rl-at-555659632532` | Previous key stopped authenticating; same AWS account (555659632532) |
| 2026-11-04 | Bedrock key wired into OpenCode CLI | `AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION=ap-southeast-2` as user env vars, so `opencode` runs Claude on Bedrock |
| 2026-11-04 | OpenCode Bedrock model list restricted to what the account can invoke | Account has access only to `au.anthropic.claude-sonnet-4-6`, `au.anthropic.claude-opus-4-6-v1`, `au.anthropic.claude-haiku-4-5-20251001-v1:0` and `amazon.nova-pro-v1:0`; bare model IDs are aliased to the `au.` inference profile |

---

## 3. Key Files

| File | Purpose |
|---|---|
| `lib/ai/bedrock.ts` | AWS Bedrock client, structured AI calls, website signals cache |
| `lib/ai/prompts.ts` | All AI prompt templates (analysis, cluster, brief, outline) |
| `lib/ai/sections.ts` | Section draft/improve for editor |
| `lib/ai/extract.ts` | Website scraper (5s timeout, extracts title/headings/topTerms) |
| `lib/ai/schemas.ts` | Zod schemas for all AI outputs |
| `lib/plan.ts` | getPlanStatus() — single source of truth for "is user Pro" |
| `lib/billing/subscription.ts` | getSubscription(), canCreateProject() |
| `lib/credits.ts` | reserveCredit(), refundCredit(), logClaim() |
| `lib/dodo.ts` | Dodo product IDs, payment link builders, plan/cycle types |
| `lib/analysis/readability.ts` | Flesch-Kincaid readability (strips markdown before scoring) |
| `lib/analysis/seo.ts` | SEO score (6 checks) |
| `app/api/webhooks/dodo/route.ts` | Dodo webhook handler — activates/cancels subscriptions |
| `app/api/checkout/route.ts` | Creates Dodo checkout sessions server-side |
| `app/onboarding/actions.ts` | completeOnboarding — saves goal/plan, redirects to checkout for paid plans |
| `components/billing/upgrade-panel.tsx` | Uses CheckoutProvider + CheckoutFrame (inline Dodo SDK) |
| `components/dashboard/doc-editor.tsx` | Main draft editor with readability + SEO sidebar |
| `components/dashboard/sidebar-nav.tsx` | Sidebar nav — main nav + Settings section (Account, Billing, Upgrade, Docs) |

---

## 4. Environment Variables (all required in Vercel production)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://yogawritecode.com` (no trailing space!) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | For webhook handler (unauthenticated context) |
| `DODO_PAYMENTS_API_KEY` | Server-side Dodo API key (creates checkout sessions) |
| `DODO_WEBHOOK_SECRET` | `whsec_...` — verifies Dodo webhook signatures |
| `DODO_ENVIRONMENT` | `live` or `test` |
| `NEXT_PUBLIC_DODO_PAYMENT_LINK` | Hosted Pro buy URL (fallback for checkout button) |
| `DODO_STARTER_YEARLY_PRODUCT_ID` | pdt_0NqvFRO2pZgWeLVX57kDE |
| `DODO_PRO_YEARLY_PRODUCT_ID` | pdt_0NqvFRPKutdWjaxCPdK30 |
| `DODO_SCALE_YEARLY_PRODUCT_ID` | pdt_0NqvFRQeWVstTKkihQXWo |
| `AWS_REGION` | `ap-southeast-2` |
| `AWS_ACCESS_KEY_ID` | Bedrock access key |
| `AWS_SECRET_ACCESS_KEY` | Bedrock secret key |
| `AWS_BEARER_TOKEN_BEDROCK` | Bedrock API key (`ABSK...`, key `52rl-at-555659632532`) — used for auth when present |
| `BEDROCK_MODEL_ID` | `au.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| `RESEND_API_KEY` | Transactional email |
| `RESEND_FROM_EMAIL` | `Yoga Write Code <hello@yogawritecode.com>` |
| `GOOGLE_CLIENT_ID` | Google OAuth for Search Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_OAUTH_TOKEN_KEY` | `02c63b6b99233e241c70f86d791a96b8f7d6561d88b30f20c6ac5247e8b621d6` |
| `CRON_SECRET` | For trial-expiry cron endpoint |

---

## 5. Dodo Products (Live Mode)

| Plan | Billing | Product ID |
|---|---|---|
| Starter | Monthly | pdt_0NpdaJfvYRH4No4Adhd7F |
| Pro Writer | Monthly | pdt_0Np8pi0UC8l26KKHxN9Pc |
| Scale | Monthly | pdt_0NpdcPj2kwmZyFUWgG2KH |
| Starter | Yearly | pdt_0NqvFRO2pZgWeLVX57kDE |
| Pro Writer | Yearly | pdt_0NqvFRPKutdWjaxCPdK30 |
| Scale | Yearly | pdt_0NqvFRQeWVstTKkihQXWo |

**Webhook endpoint:** `https://app.yogawritecode.com/api/webhooks/dodo`
**Subscribed events:** payment.succeeded, subscription.active, subscription.created, subscription.renewed, subscription.cancelled, subscription.expired, subscription.on_hold, subscription.failed

---

## 6. Known Issues / Watch Out

| Issue | Status | Notes |
|---|---|---|
| Google Sign-in Error 403 | ⚠️ Fix in Google Cloud Console | Publish OAuth app OR add test users |
| SSL cert on app.yogawritecode.com | ⚠️ Fix in Vercel DNS | Add domain in Vercel → SSL auto-provisions |
| All 6 Dodo products must be Active | ⚠️ Do in Dodo Dashboard | Only 1 of 6 was active |
| RLS disabled on all tables | ⚠️ Tech debt | Must enable before scale |

---

## 7. Failed Approaches

| Approach | Why it failed | Lesson |
|---|---|---|
| `revalidatePath()` + `redirect()` together | NEXT_REDIRECT loop | Pick one or call revalidate before redirect |
| Naive `JSON.parse()` on AI response | AI adds markdown fences | Always strip fences + extract JSON object first |
| Relative OG image URL `/opengraph-image` | LinkedIn/Facebook/Slack need absolute URLs | Always use `https://yogawritecode.com/opengraph-image` |
| `NEXT_PUBLIC_SITE_URL` with leading space | Broke URL resolution everywhere | Value must be exactly `https://yogawritecode.com` |
| Public `/checkout` marketing page | Users hit it without being signed in | All payments now go through `/dashboard/upgrade` |
| `extractWebsiteSignals` called per workflow step | 4 redundant HTTP requests per project | Cached in `BedrockAIProvider.signalsCache` map |
