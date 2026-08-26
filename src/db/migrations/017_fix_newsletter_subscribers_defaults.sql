-- Comprehensive defensive fix for newsletter_subscribers.
--
-- An early migration run (against a connection that turned out not to
-- support this app's full pool configuration) appears to have created
-- this table successfully but silently dropped some column
-- defaults/constraints along the way. Already found and fixed: the
-- UNIQUE index on email (016). Now also found missing: is_active's
-- default. Rather than fix these one at a time as each missing piece
-- surfaces in production, this migration re-asserts every
-- default/constraint this table is supposed to have, gathered from every
-- migration that's ever touched it (006, 008, 010).
--
-- Every statement here is idempotent — safe to run whether the target
-- state already exists or not. The only way any of this fails is if
-- existing rows already violate it (e.g. a genuine NULL already sitting
-- in a column we're marking NOT NULL) — if that happens, it'll surface
-- as a clear, specific Postgres error naming the offending column, not a
-- silent problem.

ALTER TABLE newsletter_subscribers ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE newsletter_subscribers ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE newsletter_subscribers ALTER COLUMN subscribed_at SET DEFAULT now();
ALTER TABLE newsletter_subscribers ALTER COLUMN subscribed_at SET NOT NULL;

ALTER TABLE newsletter_subscribers ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE newsletter_subscribers ALTER COLUMN points SET NOT NULL;

ALTER TABLE newsletter_subscribers ALTER COLUMN email SET NOT NULL;
