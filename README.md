# RollCall Kitchen — Authentic Kathi Rolls, Kebabs & Bobba

A production-oriented, PostgreSQL-backed Node.js/Express website for RollCall
Kitchen (9630 University City Blvd, Charlotte, NC 28213, Unit D). Every menu
item, price, and piece of site copy lives in the database — nothing is
hardcoded — and the codebase is split into clear layers (routes →
controllers → services → repositories → database) so it's straightforward
to extend.

## ⚠️ Before you go live

A few things in the seed data are **placeholders** because they weren't
provided and needed a value to ship a working site. Update these in
`src/db/seed.js` (under `contentBlocks.brand` and the `locations` array),
then re-run `npm run db:seed`:

- **Phone number** — currently `(704) 000-0000`
- **Email** — currently `hello@rollcallkitchen.com`
- **Instagram / Facebook links** — currently `#`
- **Hours** — currently a reasonable placeholder (Mon–Thu 11–9, Fri–Sat 11–10, Sun 12–9); confirm against your real hours
- **About page story/timeline copy** — written to be true-to-brand (Kolkata street food, kathi rolls, University City Blvd) without inventing specific founding dates or history, since none were provided. Feel free to replace with your real story.

Everything else — the full 132-item menu, categories, prices, veg/spice
tags, the real store address, and the logo — is pulled directly from what
you provided.

## Architecture

```
server.js                 Composition root: DB connection retry, graceful shutdown, crash safety nets
src/
  app.js                  Express app assembly (middleware pipeline + routes) — no listening here
  config/
    env.js                All environment variables, validated, with sane dev defaults
    database.js           PostgreSQL connection pool (the only file that touches `pg` directly)
    logger.js              Leveled structured logger
  db/
    migrations/*.sql       Numbered, idempotent schema migrations
    migrate.js              Migration runner (tracks applied migrations in `schema_migrations`)
    seed.js                  Idempotent content seeder — the real menu, location, and site copy live here
  repositories/            Raw SQL data access. No business logic, no caching, no HTTP.
  services/                Business logic + caching. Composes repositories.
  controllers/             Gathers data from services, renders views / sends JSON. No SQL.
  routes/                  Express routers — wires validators + rate limits + controllers together
  middleware/               asyncHandler, centralized errorHandler, validate, rateLimiter, security (helmet)
  validators/                express-validator chains for every form
views/                      EJS templates — all data-driven, no hardcoded menu/location/copy
public/                     Static CSS/JS/images (client-side cart, filters, animations, logo assets)
```

## Quick start (local, without Docker)

You need Node.js 18+ and a running PostgreSQL 14+ instance.

```bash
npm install
cp .env.example .env        # then edit .env with your local Postgres credentials
npm run db:setup            # runs migrations, then seeds the real menu + site content
npm start                   # http://localhost:3000
```

`npm run dev` runs the same thing with Node's built-in `--watch` for
auto-restart on file changes while developing.

## Quick start (Docker Compose)

```bash
docker compose up --build
```

This starts Postgres and the app together, runs migrations + seed
automatically on boot, and serves the site at `http://localhost:3000`. Data
persists in a named volume (`rollcall_pgdata`) across restarts.

## Everything is database-driven

There are no hardcoded menu items, prices, the address, testimonials, FAQs,
or marketing copy anywhere in the templates or controllers. Content lives in
these tables (see `src/db/migrations/` for exact columns):

| Table | Powers |
|---|---|
| `categories`, `dishes` | The menu — all 14 sections, 132 items, prices, spice level, veg/non-veg, tags |
| `locations` | Store address (9630 University City Blvd, Unit D), hours (JSONB), phone, features, map link |
| `testimonials`, `gallery_items` | Homepage social proof and gallery |
| `faqs` | Contact page FAQ accordion |
| `timeline_events`, `value_props` | About page story timeline and value cards |
| `reward_steps`, `reward_tiers` | RollCall Rewards program page |
| `catering_packages` | Catering page package cards |
| `content_blocks` | Flexible key→JSON store for brand info (name, tagline, **address**, phone, socials), hero copy, marquee items, trust-bar stats, per-page hero text |
| `contact_messages`, `catering_requests`, `reservations`, `newsletter_subscribers` | Everything customers submit |

**To change any content** (menu items, prices, the address, hours, brand
info), edit `src/db/seed.js` and re-run `npm run db:seed` — every insert
there is an upsert or full replace, so it's safe to run repeatedly and acts
as a lightweight "content as code" workflow. For a real admin UI down the
line, the repository/service layers underneath are already in place.

## The address, front and center

Per the requirement that customers can always find the store, RollCall
Kitchen's address (9630 University City Blvd, Charlotte, NC 28213, Unit D)
appears in:

- A dedicated address bar above the header on **every page**, linking straight to Google Maps directions
- The homepage hero and a dedicated "Visit Us" spotlight section with an embedded Google Map
- The footer on every page
- The full Locations page, with an embedded map and a "Get Directions" button
- The Contact page's quick-contact list

All of these pull from the single `locations` row (and the `brand.address`
content block) — update the address in one place in `seed.js` and it
updates everywhere.

## Branding assets

- `public/images/logo-badge.png` — the circular "Roll Call" badge logo, used as the header/footer mark and the site favicon
- `public/images/logo-mascot.png` — the full mascot illustration, featured prominently in the homepage hero and the About page hero

## Designed to handle real traffic without falling over

**Connection pooling, not one connection per request.** `src/config/database.js`
uses a `pg.Pool` sized via `DB_POOL_MAX`/`DB_POOL_MIN`. A pool-level `error`
listener is attached specifically to stop the classic Node+pg crash: an idle
pooled client emitting a network error with no listener attached, which Node
otherwise treats as an uncaught exception and kills the whole process.

**Nothing can crash the process from inside a request.** Every controller is
wrapped in `asyncHandler`, so a failed query becomes a normal `next(err)` call
into the centralized error handler instead of an unhandled promise rejection.
Statement/connection timeouts (`DB_STATEMENT_TIMEOUT_MS`) stop one slow query
from holding a connection — and therefore capacity — forever.

**Caching shields the database from read spikes.** Menu, categories,
location, and site copy are cached briefly (`src/services/cache.service.js`,
TTL via `CACHE_TTL_SECONDS`) using an in-memory store behind a `get/set/wrap`
interface. If you run more than one app instance, swap the internals of that
one file for a Redis client — nothing else in the codebase needs to know.

**Rate limiting protects the write path.** General traffic gets a generous
limit; the endpoints that write to the database (contact, catering,
reservations, newsletter) get a much stricter one.

**Input validation on every form**, via `express-validator` chains in
`src/validators/`, on top of parameterized queries everywhere — SQL
injection isn't possible from form input.

**Graceful shutdown.** On `SIGTERM`/`SIGINT` (a container stop, a PM2 reload,
a Kubernetes rollout), the server stops accepting new connections, lets
in-flight requests finish, then closes the database pool.

**Horizontal + multi-core scaling.** The app is stateless (the order cart
lives in the browser's `localStorage`), so it's safe to run many instances
behind a load balancer. For a single machine, `ecosystem.config.js` runs it
under [PM2](https://pm2.keymetrics.io/) in cluster mode:

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 reload rollcall-kitchen   # zero-downtime reload on future deploys
```

**Health checks.** `GET /api/health` does a real database round-trip and
returns 503 if it fails — point your load balancer, container orchestrator
readiness probe, or uptime monitor at it. The `Dockerfile` already wires
this in as the container `HEALTHCHECK`.

## Tuning for scale

All of the following are environment variables (`.env.example` has the full
list with defaults):

- `DB_POOL_MAX` / `DB_POOL_MIN` — size the pool to your Postgres instance's
  `max_connections`, divided across however many app instances you run.
- `DB_STATEMENT_TIMEOUT_MS` — lower this if you want slow queries killed faster.
- `CACHE_TTL_SECONDS` — raise it to cut DB load further at the cost of content
  updates taking longer to appear; lower it while actively editing content.
- `RATE_LIMIT_MAX_GENERAL` / `RATE_LIMIT_MAX_WRITE` — tune per your expected
  legitimate traffic volume.

## Stack

- Node.js + Express, layered (routes/controllers/services/repositories)
- PostgreSQL via `pg` (node-postgres), connection-pooled, migration-tracked
- EJS templates (server-rendered, no build step) — fully data-driven
- `node-cache` for read-through caching (Redis-swappable)
- `express-validator`, `helmet`, `express-rate-limit`, `compression`, `morgan`
- Vanilla CSS/JS on the frontend — no framework, no build step
- PM2 (`ecosystem.config.js`) for clustering; Docker/Docker Compose included
