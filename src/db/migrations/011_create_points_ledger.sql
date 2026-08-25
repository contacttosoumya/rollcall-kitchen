-- Every points change — earned or redeemed — gets an append-only entry
-- here, in addition to the running total cached on
-- newsletter_subscribers.points. The cached total keeps balance lookups
-- fast (no SUM() on every page load); this table is what makes that total
-- auditable and lets a member (or staff) see exactly how they got there.
CREATE TABLE IF NOT EXISTS points_ledger (
  id            BIGSERIAL PRIMARY KEY,
  subscriber_id BIGINT NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  direction     VARCHAR(10) NOT NULL CHECK (direction IN ('earn', 'redeem')),
  points        INTEGER NOT NULL CHECK (points > 0),
  reason        VARCHAR(255) NOT NULL,
  -- Where the points came from / were spent — 'signup', 'redemption', or an
  -- order source once orders start feeding in: 'doordash', 'ubereats',
  -- 'phone', 'pos', 'manual'.
  source        VARCHAR(30) NOT NULL DEFAULT 'system',
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_subscriber ON points_ledger (subscriber_id, created_at DESC);