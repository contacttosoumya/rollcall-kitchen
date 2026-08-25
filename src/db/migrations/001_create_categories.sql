-- Menu categories (Chaat, Biryani, Curries, ...)
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(60) NOT NULL UNIQUE,
  label       VARCHAR(120) NOT NULL,
  icon        VARCHAR(10) NOT NULL DEFAULT '🍽️',
  blurb       VARCHAR(200) NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories (is_active, sort_order);
