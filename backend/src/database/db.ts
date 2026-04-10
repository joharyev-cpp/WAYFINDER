import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'wayfinder.sqlite');

// Ensure parent directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS pois (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT NOT NULL,
    category      TEXT NOT NULL,
    country       TEXT NOT NULL CHECK(country IN ('MU','MG')),
    latitude      REAL NOT NULL,
    longitude     REAL NOT NULL,
    address       TEXT NOT NULL DEFAULT '',
    image_url     TEXT,
    audio_guide_url TEXT,
    website_url   TEXT,
    opening_hours TEXT,
    entry_fee     TEXT,
    languages     TEXT NOT NULL DEFAULT '["fr","en"]',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS beacons (
    id            TEXT PRIMARY KEY,
    uuid          TEXT NOT NULL,
    major         INTEGER NOT NULL,
    minor         INTEGER NOT NULL,
    poi_id        TEXT NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    label         TEXT NOT NULL DEFAULT '',
    tx_power      INTEGER NOT NULL DEFAULT -65,
    active        INTEGER NOT NULL DEFAULT 1,
    installed_at  TEXT,
    battery_level INTEGER,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(uuid, major, minor)
  );

  CREATE TABLE IF NOT EXISTS content_blocks (
    id      TEXT PRIMARY KEY,
    poi_id  TEXT NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    lang    TEXT NOT NULL DEFAULT 'fr',
    title   TEXT NOT NULL,
    body    TEXT NOT NULL,
    type    TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text','tip','history','promo'))
  );

  CREATE TABLE IF NOT EXISTS nearby_services (
    id                  TEXT PRIMARY KEY,
    poi_id              TEXT NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    type                TEXT NOT NULL,
    name                TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    phone               TEXT,
    distance_meters     INTEGER NOT NULL DEFAULT 0,
    price_range         TEXT
  );

  CREATE TABLE IF NOT EXISTS detection_events (
    id                      TEXT PRIMARY KEY,
    beacon_id               TEXT NOT NULL,
    rssi                    INTEGER NOT NULL,
    estimated_distance_m    REAL NOT NULL,
    device_id               TEXT NOT NULL,
    detected_at             TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_beacons_poi    ON beacons(poi_id);
  CREATE INDEX IF NOT EXISTS idx_content_poi    ON content_blocks(poi_id);
  CREATE INDEX IF NOT EXISTS idx_services_poi   ON nearby_services(poi_id);
  CREATE INDEX IF NOT EXISTS idx_events_beacon  ON detection_events(beacon_id);
  CREATE INDEX IF NOT EXISTS idx_events_time    ON detection_events(detected_at);
`);

export default db;
