-- RollCall Rewards previously had no actual points ledger — the "100
-- points" welcome offer was only ever described in marketing copy and the
-- welcome email, never recorded anywhere. This adds a real running balance
-- per subscriber so customers can actually check what they've earned.
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN newsletter_subscribers.points IS
  'Running RollCall Rewards points balance for this email. Awarded on signup (welcome bonus) and future qualifying actions.';