-- Single-use, short-lived tokens for RollCall Rewards magic-link sign-in.
-- A customer requests a link, we email them a token, they click it once,
-- and it's marked used — this table is only ever consulted at that moment,
-- not on every page load (the actual "session" afterward is a signed cookie).
CREATE TABLE IF NOT EXISTS rewards_login_tokens (
  id          BIGSERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  token       VARCHAR(64) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_login_tokens_token ON rewards_login_tokens (token);
CREATE INDEX IF NOT EXISTS idx_rewards_login_tokens_email ON rewards_login_tokens (email);