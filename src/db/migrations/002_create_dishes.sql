-- Individual menu items
CREATE TABLE IF NOT EXISTS dishes (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  is_veg        BOOLEAN NOT NULL DEFAULT TRUE,
  spice_level   SMALLINT NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
  tags          TEXT[] NOT NULL DEFAULT '{}',       -- e.g. {bestseller,new,chefs-pick}
  icon          VARCHAR(10),                         -- optional override; falls back to category icon
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes (category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_available_sort ON dishes (is_available, sort_order);
CREATE INDEX IF NOT EXISTS idx_dishes_tags ON dishes USING GIN (tags);
-- Full-text search across name + description powers the menu search box server-side at scale.
CREATE INDEX IF NOT EXISTS idx_dishes_search ON dishes USING GIN (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
