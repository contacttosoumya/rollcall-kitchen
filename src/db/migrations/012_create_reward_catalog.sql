-- What a member can redeem their points for. Fully editable from the
-- database (see src/db/seed.js) — add, remove, or reprice rewards without
-- touching any code.
CREATE TABLE IF NOT EXISTS reward_catalog (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(150) NOT NULL UNIQUE,
  description  VARCHAR(255) NOT NULL DEFAULT '',
  points_cost  INTEGER NOT NULL CHECK (points_cost > 0),
  reward_type  VARCHAR(30) NOT NULL DEFAULT 'discount', -- 'discount' | 'free_item'
  reward_value VARCHAR(60) NOT NULL DEFAULT '',          -- e.g. "$5" or "Free Samosa Chaat"
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_catalog_active_sort ON reward_catalog (is_active, sort_order);