-- Phone becomes a second way to identify the same rewards account, so a
-- future POS/delivery-platform integration (or a phone order taken by
-- staff) can match a customer even when only a phone number is captured,
-- not an email. Nullable and unique — a member may have neither, either,
-- or both set, but each phone number can only belong to one account.
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_phone ON newsletter_subscribers (phone);