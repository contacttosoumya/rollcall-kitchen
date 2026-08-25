-- Every order the rewards program knows about, regardless of where it came
-- from. Nothing calls into this table automatically yet — orders happen
-- off-site (DoorDash, Uber Eats, phone) with no webhook a small restaurant
-- can plug into today. This table plus posIntegration.service.js is the
-- ready-to-go bridge: usable right now via a manual/staff endpoint, and
-- exactly what a future POS or delivery-platform webhook would write into
-- without any schema changes.
CREATE TABLE IF NOT EXISTS pos_orders (
  id                BIGSERIAL PRIMARY KEY,
  external_order_id VARCHAR(120),           -- the order ID from DoorDash/Uber Eats/POS, if any
  source            VARCHAR(30) NOT NULL,   -- 'doordash' | 'ubereats' | 'phone' | 'pos' | 'manual'
  customer_email    VARCHAR(255),
  customer_phone    VARCHAR(20),
  subscriber_id     BIGINT REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  amount_cents      INTEGER NOT NULL,
  points_awarded    INTEGER NOT NULL DEFAULT 0,
  raw_payload       JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_orders_subscriber ON pos_orders (subscriber_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_source ON pos_orders (source);