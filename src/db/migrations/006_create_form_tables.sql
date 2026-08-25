-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  subject      VARCHAR(150) NOT NULL DEFAULT 'General question',
  message      TEXT NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | read | resolved
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

-- Catering / events quote requests
CREATE TABLE IF NOT EXISTS catering_requests (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(30) NOT NULL,
  event_date    DATE,
  guest_count   INTEGER,
  details       TEXT NOT NULL DEFAULT '',
  status        VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | quoted | booked | closed
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_catering_requests_created ON catering_requests (created_at DESC);

-- Table reservation requests
CREATE TABLE IF NOT EXISTS reservations (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  phone           VARCHAR(30) NOT NULL,
  party_size      INTEGER NOT NULL DEFAULT 2,
  location_id     INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  notes           TEXT NOT NULL DEFAULT '',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | confirmed | cancelled
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations (reservation_date, reservation_time);

-- Newsletter / rewards signups
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
