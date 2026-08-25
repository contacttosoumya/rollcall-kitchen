-- All application tables live in a dedicated schema (rollcallkitchen)
-- rather than Postgres's default "public" schema, matching the target
-- database's existing structure. Every connection has its search_path set
-- to this schema first (see src/config/database.js), so the rest of the
-- migrations and application code can reference tables unqualified.
CREATE SCHEMA IF NOT EXISTS rollcallkitchen;