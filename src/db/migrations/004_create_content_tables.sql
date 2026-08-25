-- Customer testimonials shown in the homepage carousel
CREATE TABLE IF NOT EXISTS testimonials (
  id            SERIAL PRIMARY KEY,
  author_name   VARCHAR(120) NOT NULL,
  author_detail VARCHAR(150) NOT NULL DEFAULT '',  -- e.g. "South End" or "The Sharma Family"
  quote         TEXT NOT NULL,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_sort ON testimonials (is_active, sort_order);

-- Gallery tiles (#RollCallKitchen scroll section)
CREATE TABLE IF NOT EXISTS gallery_items (
  id            SERIAL PRIMARY KEY,
  icon          VARCHAR(10) NOT NULL,
  swatch        VARCHAR(20) NOT NULL DEFAULT 'sw-marigold',
  caption       VARCHAR(150) NOT NULL DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_active_sort ON gallery_items (is_active, sort_order);

-- FAQ accordion on the Contact page
CREATE TABLE IF NOT EXISTS faqs (
  id            SERIAL PRIMARY KEY,
  question      VARCHAR(255) NOT NULL,
  answer        TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_faqs_active_sort ON faqs (is_active, sort_order);

-- "Our Story" timeline on the About page
CREATE TABLE IF NOT EXISTS timeline_events (
  id            SERIAL PRIMARY KEY,
  year_label    VARCHAR(60) NOT NULL,   -- e.g. "2011 — The Cart"
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timeline_active_sort ON timeline_events (is_active, sort_order);

-- "What we won't compromise on" value cards on the About page
CREATE TABLE IF NOT EXISTS value_props (
  id            SERIAL PRIMARY KEY,
  icon          VARCHAR(10) NOT NULL,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_value_props_active_sort ON value_props (is_active, sort_order);
