-- RollCall Rewards "how it works" steps
CREATE TABLE IF NOT EXISTS reward_steps (
  id            SERIAL PRIMARY KEY,
  step_number   VARCHAR(4) NOT NULL,   -- kept as text so it renders "01" style
  title         VARCHAR(120) NOT NULL,
  description   TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- RollCall Rewards membership tiers
CREATE TABLE IF NOT EXISTS reward_tiers (
  id              SERIAL PRIMARY KEY,
  badge           VARCHAR(60) NOT NULL,   -- e.g. "🥉 Street Cart"
  points_range    VARCHAR(60) NOT NULL,   -- e.g. "0 – 499 points"
  perks           TEXT[] NOT NULL DEFAULT '{}',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Catering packages
CREATE TABLE IF NOT EXISTS catering_packages (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  price_label     VARCHAR(80) NOT NULL,   -- e.g. "from $14 / person"
  features        TEXT[] NOT NULL DEFAULT '{}',
  tag             VARCHAR(60),            -- e.g. "Most Popular"; null if none
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_reward_steps_sort ON reward_steps (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reward_tiers_sort ON reward_tiers (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_catering_packages_sort ON catering_packages (is_active, sort_order);
