-- Sandhya database schema. Idempotent — safe to re-run on every server boot.

CREATE TABLE IF NOT EXISTS pairings (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  tradition                TEXT NOT NULL CHECK (tradition IN ('gita','devi_bhagavatam')),
  stoic_theme              TEXT NOT NULL,
  stoic_concept            TEXT NOT NULL,
  stoic_source_ref         TEXT,
  verse_ref                TEXT NOT NULL,
  verse_paraphrase         TEXT NOT NULL,
  translation_source_note  TEXT,
  bridge_prompt            TEXT NOT NULL,
  origin                   TEXT NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed','user','ai_explore')),
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pairings_tradition ON pairings(tradition);

CREATE TABLE IF NOT EXISTS journal_entries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date      TEXT NOT NULL UNIQUE,
  pairing_id      INTEGER REFERENCES pairings(id) ON DELETE SET NULL,
  reflection_text TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sorted_thoughts (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date          TEXT NOT NULL,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  worry_text          TEXT NOT NULL,
  bucket              TEXT NOT NULL CHECK (bucket IN ('full_control','partial_control','no_control')),
  stoic_reframe       TEXT NOT NULL,
  stoic_concept_ref   TEXT,
  gita_reframe        TEXT NOT NULL,
  gita_concept_ref    TEXT,
  source              TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai_assisted')),
  outcome_note        TEXT,
  outcome_recorded_at TEXT,
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sorted_thoughts_entry_date ON sorted_thoughts(entry_date);

CREATE TABLE IF NOT EXISTS settings (
  id                   INTEGER PRIMARY KEY CHECK (id = 1),
  tradition_preference TEXT NOT NULL DEFAULT 'both' CHECK (tradition_preference IN ('gita','devi_bhagavatam','both')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS ai_cache (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  request_type  TEXT NOT NULL CHECK (request_type IN ('bridge','explore','thought_sort','weekly_digest')),
  input_hash    TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (request_type, input_hash)
);
