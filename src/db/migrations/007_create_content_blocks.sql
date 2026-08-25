-- Lightweight CMS table: arbitrary structured content (brand info, hero copy,
-- marquee items, trust-bar stats, etc.) keyed by a stable string so every
-- page can pull its copy from the database instead of hardcoded template text.
-- `value` is JSONB so each key can hold whatever shape it needs (an object,
-- an array of objects, a plain string) without a schema migration.
CREATE TABLE IF NOT EXISTS content_blocks (
  key         VARCHAR(80) PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at auto-touch trigger, reused by a couple of tables.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_content_blocks_updated ON content_blocks;
CREATE TRIGGER trg_content_blocks_updated
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated ON categories;
CREATE TRIGGER trg_categories_updated
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_dishes_updated ON dishes;
CREATE TRIGGER trg_dishes_updated
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_locations_updated ON locations;
CREATE TRIGGER trg_locations_updated
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
