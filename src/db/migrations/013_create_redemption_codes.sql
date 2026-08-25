-- A short-lived, single-use code generated when a member redeems a reward.
-- Points are deducted the moment the code is created (see
-- rewardsProgram.service.js) — staff verify and honor the code in person,
-- exactly like any other coupon, with no new software for them to learn.
CREATE TABLE IF NOT EXISTS redemption_codes (
  id                BIGSERIAL PRIMARY KEY,
  subscriber_id     BIGINT NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  reward_catalog_id INTEGER NOT NULL REFERENCES reward_catalog(id),
  code              VARCHAR(20) NOT NULL UNIQUE,
  points_spent      INTEGER NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'used' | 'expired'
  expires_at        TIMESTAMPTZ NOT NULL,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemption_codes_code ON redemption_codes (code);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_subscriber ON redemption_codes (subscriber_id);