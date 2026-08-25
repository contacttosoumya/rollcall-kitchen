-- Restaurant locations
CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  phone       VARCHAR(30) NOT NULL,
  latitude    NUMERIC(9,6),
  longitude   NUMERIC(9,6),
  map_query   VARCHAR(255) NOT NULL,
  hours       JSONB NOT NULL DEFAULT '[]',   -- [{ "days": "Mon – Thu", "time": "11:00 AM – 9:30 PM" }, ...]
  features    TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {Dine-in,Takeout,Delivery}
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_active_sort ON locations (is_active, sort_order);
