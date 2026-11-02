# TRD — Technical Requirements Document
## Yoga Write Code (YWC) — Dodo Payments checkout & billing

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | 2026-11-01 |
| Scope | FR-6, SEC-3, SEC-6, INT-4, NFR-2 |
| Owner | Yoga Write Code engineering |

Companion documents: `PRD.md` (product), `ARCHITECTURE.md` (structure),
`CODING_RULES.md` (TypeScript rules), `DESIGN_SYSTEM.md` (UI), `TASKS.md` (progress),
`PROJECT_MEMORY.md` (decisions).

---

## 1. Context

YWC monetises with Dodo Payments. The product already has a trial and a hosted
checkout (`/dashboard/pricing`, `/api/checkout`), but it has no single,
enforced paywall and no idempotent, signed webhook contract. This TRD pins down
the **Dodo checkout flow** that turns a free account into a paying one:

1. A free-tier user hits the paywall and is sent to `/dashboard/upgrade`.
2. The upgrade page hands a **public** Dodo payment link to a client button.
3. The button redirects to Dodo's hosted checkout with a `redirect_url` back to
   `/dashboard/payment-success`.
4. Dodo calls `POST /api/webhooks/dodo`. The route verifies the signature, dedupes
   the event and flips the user's `subscription_status` in Postgres.
5. The dashboard UI reflects the plan from the database.

**Architectural rules that apply (ARCHITECTURE.md):**

- Server-first: pages fetch, components render.
- Thin pages: `page.tsx` only fetches and renders.
- Actions are backend: all DB writes live in server actions / route handlers.
- One source of truth: the database is canonical; the UI mirrors it.
- Fail visibly: never silently swallow errors.

---

## 2. Requirement IDs

| ID | Requirement |
|---|---|
| **FR-6** | Free-tier paywall + Pro upgrade flow |
| **SEC-3** | Signed, idempotent webhook ingestion |
| **SEC-6** | No secrets in client code |
| **INT-4** | Dodo Payments checkout integration |
| **NFR-2** | Webhook reliability & latency budget |

---

## 3. Functional requirements

### FR-6 — Free-tier paywall and Pro upgrade

**FR-6.1** The free tier is limited to **1 active project**. A user on the free
tier who already owns at least one project cannot create another.

**FR-6.2** The limit is enforced **server-side**, in the server action that
creates projects. Hiding the UI button is *not* sufficient — a crafted POST to
the action must be rejected. On rejection the action redirects to
`/dashboard/upgrade?error=free-limit`.

**FR-6.3** `canCreateProject()` is the single decision point:

| `subscription_status` | Projects owned | Result |
|---|---|---|
| `free` | `>= 1` | `false` — redirect to upgrade |
| `free` | `0` | `true` |
| `active` / `trialing` / `on_hold` | any | `true` |
| `canceled` / `failed` / unknown | `>= 1` | `false` |

An account with a live no-card trial (`trial_end` in auth metadata) keeps Pro
features, so it is not blocked. `lib/plan.ts` (`getPlanStatus`) is the single
source of truth for "is this account Pro"; `lib/billing/subscription.ts` is the
single source of truth for "what does the profile row say".

**FR-6.4** `/dashboard/upgrade` is a **thin server component**. It fetches the
subscription with `getSubscription()`, reads the public payment link from the
environment and hands both to a presentational component. It contains no markup
logic and no data fetching beyond that.

**FR-6.5** The upgrade page shows exactly one plan card:

- Plan name **Pro**, price **$19 / month**
- A **"MOST POPULAR"** badge
- A feature list rendered with green checkmarks (`#15803D`)
- A `CheckoutButton` that performs the checkout redirect

**FR-6.6** When the account already has Pro access the page renders a
**"Current plan"** state instead of the checkout button. No second payment can
be started from an already-active account.

**FR-6.7** `/dashboard/payment-success` confirms the payment:

- A green checkmark card (`#DCFCE7` background, `#15803D` icon)
- Heading **"Payment Successful!"**
- Note **"Your Pro access activates within a few seconds."**
- A button back to `/dashboard`

**FR-6.8** The dashboard sidebar shows the current plan badge (**Free** /
**Pro**) and the remaining AI credit balance, read from `getSubscription()`.

**FR-6.9** A missing profile row is **not** an error. It is treated as the free
tier (`subscription_status = 'free'`, `ai_credits = 50`,
`dodo_subscription_id = null`) and every helper stays null-safe.

### INT-4 — Dodo Payments checkout integration

**INT-4.1** The checkout is started from a **hosted Dodo payment link**
(`NEXT_PUBLIC_DODO_PAYMENT_LINK`). The link is a public buy URL — it is safe to
expose, and it is the only Dodo value the browser ever sees.

**INT-4.2** The client redirect adds a `redirect_url` query parameter pointing
at `https://app.yogawritecode.com/dashboard/payment-success`. The value is
URL-encoded.

**INT-4.3** If the payment link is not configured, the button renders **disabled**
with the tooltip **"Payments not configured"**. The flow never dead-ends on a
404 from the payment provider.

**INT-4.4** The button shows a pending state **"Redirecting…"** while the
browser navigates away, so a double click cannot open two checkout tabs.

**INT-4.5** The Dodo webhook maps to subscription state as follows:

| Event | Effect on `profiles` |
|---|---|
| `subscription.created` (TRD alias), `subscription.active`, `subscription.renewed`, `payment.succeeded` | `subscription_status = 'active'`, `dodo_customer_id` + `dodo_subscription_id` saved |
| `subscription.canceled` (TRD alias), `subscription.cancelled`, `subscription.expired` | `subscription_status = 'canceled'` |
| `subscription.on_hold` | `subscription_status = 'on_hold'` (access kept during Dodo's retry window) |
| `subscription.failed` | `subscription_status = 'failed'` (access revoked) |

`subscription.created` / `subscription.canceled` are the TRD aliases for
Dodo's canonical `subscription.active` / `subscription.cancelled`. Both spellings
are accepted so the contract in this document and the events Dodo actually
emits behave identically.

**INT-4.6** The profile behind an event is resolved by customer email
(case-insensitive), falling back to the checkout metadata user id and finally
to the subscription id. The email is the primary key of the lookup because it
is the only identifier Dodo guarantees on a payment event.

**INT-4.7** Cancelling at the end of the paid period does **not** revoke access
immediately — Dodo emits `subscription.expired` when the period really ends.

### SEC-3 — Signed, idempotent webhook ingestion

**SEC-3.1** The route reads the **raw request body** (`request.text()`) before
any parsing. Parsing first would change the bytes and break the signature.

**SEC-3.2** Every request is verified against the Dodo signing secret
(`DODO_WEBHOOK_SECRET`). Verification uses the Standard Webhooks scheme
(`webhook-id`, `webhook-timestamp`, `webhook-signature` headers).

**SEC-3.3** A request is rejected with **HTTP 401** — immediately, before any
database work — when:

- the signing secret is not configured, or
- the signature does not match.

Unsigned payloads are never processed. There is no "accept unsigned in dev"
escape hatch.

**SEC-3.4** Processing is **idempotent**. Before handling an event the route
inserts its `event_id` into `webhook_events` (`event_id text primary key`). A
unique-constraint conflict (Postgres `23505`) means the event was already
handled: the route returns **HTTP 200** with `{ "received": true }` and does not
touch `profiles` again.

**SEC-3.5** The idempotency key is the Standard Webhooks `webhook-id` header
(the unique message id). If the header is missing the key falls back to
`{eventType}:{objectId}` and finally to a SHA-256 of the raw body, so a key is
always produced and is always deterministic.

**SEC-3.6** After processing, the route always answers **HTTP 200** with the
JSON body `{ "received": true }`. The only non-200 answers are `401` (SEC-3.3)
and `500` for an unexpected internal failure — a `500` makes Dodo retry, and the
idempotency key makes the retry safe.

**SEC-3.7** Every log line in the route is prefixed with `[Webhook]`.

### SEC-6 — No secrets in client code

**SEC-6.1** The Dodo webhook signing secret is read **only** in the route
handler (`app/api/webhooks/dodo/route.ts`). It never appears in a client
component, a `NEXT_PUBLIC_*` variable, or any file under `components/`.

**SEC-6.2** The client bundle receives the payment link as a **prop** from a
server component. Client code never reads `process.env` directly.

**SEC-6.3** The secret API key stays server-side and is used only by
`/api/checkout` to create a Checkout Session. It is never sent to the browser.

**SEC-6.4** The webhook writes through a **service-role** Supabase client so an
unauthenticated delivery can still update the profile row. RLS stays intact for
every other client.

**SEC-6.5** Verification: `grep -rn "DODO_WEBHOOK_SECRET" app/ components/`
must match **exactly one file** — the webhook route.

### NFR-2 — Webhook reliability and latency

**NFR-2.1** A duplicate delivery never double-charges, never double-grants and
never produces an error response. It returns `200 { "received": true }`.

**NFR-2.2** Signature verification happens **before** the idempotency insert,
so an attacker cannot poison `webhook_events` with forged event ids.

**NFR-2.3** The handler performs at most three database round-trips (idempotency
insert, profile lookup, profile update) and no external network calls, so it
completes well inside the 2 s page-load budget and the Dodo delivery timeout.

**NFR-2.4** A missing `webhook_events` table (migration not applied yet) is
logged and the event is still processed — a bookkeeping gap must never lose a
payment. Idempotency resumes automatically once the table exists.

**NFR-2.5** A missing profile row is logged and answered with `200`, not an
error: the event was received and handled, there was simply nothing to update.

**NFR-2.6** Internal failures are logged with the `[Webhook]` prefix and
answered with `500` so the provider retries.

---

## 4. Data model

### `profiles` (additive columns)

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS dodo_customer_id text,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
  ADD COLUMN IF NOT EXISTS ai_credits integer DEFAULT 50;
```

### `webhook_events` (new table)

```sql
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz DEFAULT now()
);
```

> These statements are **printed for manual execution** in the Supabase SQL
> editor. They are shipped as
> `supabase/migrations/20261101000000_billing_webhook_events.sql` and are never
> executed by the application at runtime.

---

## 5. Modules

| Path | Role |
|---|---|
| `lib/billing/subscription.ts` | `getSubscription()`, `canCreateProject()`, `isProSubscription()` — server-only |
| `components/billing/checkout-button.tsx` | `"use client"` — redirect to Dodo, pending + disabled states |
| `components/billing/upgrade-panel.tsx` | Presentational upgrade card |
| `app/dashboard/upgrade/page.tsx` | Thin server component (FR-6.4) |
| `app/dashboard/payment-success/page.tsx` | Confirmation page (FR-6.7) |
| `app/api/webhooks/dodo/route.ts` | Signed, idempotent webhook (SEC-3, INT-4.5) |
| `lib/projects/actions.ts` | Project creation — paywall enforcement (FR-6.2) |
| `app/onboarding/actions.ts` | Onboarding completion — paywall enforcement (FR-6.2) |
| `components/dashboard/sidebar.tsx` | Plan badge + credits (FR-6.8) |

### Environment

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DODO_PAYMENT_LINK` | public | Hosted Dodo buy link for the Pro plan |
| `DODO_WEBHOOK_SECRET` | server | Standard Webhooks signing secret |

`DODO_PAYMENTS_WEBHOOK_KEY` is still accepted as a fallback secret so
deployments that already have it configured keep working without a migration
window. It is read in the same single place (the webhook route).

---

## 6. Verification runbook (5.1)

Every command below is executed from the repository root.

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Type-check + build | `npm run build` | exit `0`, no TypeScript errors |
| 2 | Webhook rejects unsigned payloads | `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/webhooks/dodo -H "Content-Type: application/json" -d '{}'` | `401` |
| 3 | Secret isolation | `grep -rn "DODO_WEBHOOK_SECRET" app/ components/` | only `app/api/webhooks/dodo/route.ts` |
| 4 | Idempotency | replay the same signed payload twice | second response `200 { "received": true }`, one row in `webhook_events` |
| 5 | Profile update | `subscription.created` / `payment.succeeded` for a known customer email | `profiles.subscription_status = 'active'` |
| 6 | Cancellation | `subscription.canceled` | `profiles.subscription_status = 'canceled'` |
| 7 | Paywall | create a second project as a free user | redirect to `/dashboard/upgrade?error=free-limit` |
| 8 | Environment mode | `printenv DODO_ENVIRONMENT` (see §7) | `live` (or `test` for sandbox) |

---

## 7. Environment mode

`DODO_ENVIRONMENT` selects which Dodo environment the API key belongs to:

- `live` → production (`https://live.dodopayments.com`). **Default.**
- `test` → sandbox / test mode (`https://test.dodopayments.com`).

`lib/dodo.ts` exposes this as `dodoMode(): "test" | "live"`, and
`app/api/checkout` maps it to the SDK's `live_mode` / `test_mode`. The webhook
route is environment-agnostic — the signing secret selects the environment.

> A sandbox key must never be used against a live catalog, and the reverse.
> Always print the mode before a manual checkout test.

---

## 8. Out of scope

- Proration, plan changes mid-cycle and refunds (handled by Dodo's portal).
- Usage-based billing of AI credits (credits are an internal ledger today).
- Seat-based limits and team plans.
- Re-enabling RLS on `profiles` (Task 10 in `TASKS.md`).
