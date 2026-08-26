-- Defensive fix: newsletter_subscribers.email is supposed to be UNIQUE (see
-- 006_create_form_tables.sql) — this is what submission.repository.js's
-- `ON CONFLICT (email)` upsert relies on. Some deployments ended up with
-- this table created without that constraint (an early migration run
-- against a database connection that didn't support all the options this
-- app's pool config sends). Using a unique INDEX rather than a named table
-- CONSTRAINT here specifically because CREATE UNIQUE INDEX supports
-- IF NOT EXISTS — safe to run whether or not the constraint is already
-- present, unlike ADD CONSTRAINT.
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key
  ON newsletter_subscribers (email);
