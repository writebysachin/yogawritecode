-- Yoga Write Code: billing subscription columns + webhook idempotency table.
--
-- Run this in the Supabase SQL editor. It is additive and idempotent.
--
-- TRD: FR-6 (free-tier paywall state), INT-4 (Dodo subscription state),
--      SEC-3 / NFR-2 (idempotent webhook ingestion).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS dodo_customer_id text,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
  ADD COLUMN IF NOT EXISTS ai_credits integer DEFAULT 50;

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz DEFAULT now()
);
