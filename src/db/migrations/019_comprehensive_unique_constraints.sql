-- Comprehensive unique/primary-key constraint repair.
--
-- Same root cause as 016 (newsletter_subscribers.email) and the missing
-- defaults fixed in 018 (points_ledger, etc.) -- an early migration run
-- against an unstable connection silently dropped some constraints while
-- still reporting success. This one was found via content_blocks.key,
-- which updateBrand()/updateBanner() rely on for `ON CONFLICT (key)` to
-- work at all. Rather than wait for the next one to surface reactively in
-- production, this restores every UNIQUE/PRIMARY KEY constraint from
-- every original table migration (001-015) in one pass.

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS dishes_slug_key ON dishes (slug);
CREATE UNIQUE INDEX IF NOT EXISTS locations_slug_key ON locations (slug);
CREATE UNIQUE INDEX IF NOT EXISTS content_blocks_key_key ON content_blocks (key);
CREATE UNIQUE INDEX IF NOT EXISTS rewards_login_tokens_token_key ON rewards_login_tokens (token);
CREATE UNIQUE INDEX IF NOT EXISTS reward_catalog_name_key ON reward_catalog (name);
CREATE UNIQUE INDEX IF NOT EXISTS redemption_codes_code_key ON redemption_codes (code);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON admin_users (email);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key ON newsletter_subscribers (email);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_phone_key ON newsletter_subscribers (phone);
