import { db } from "../db/connection.js";

export type Tradition = "gita" | "devi_bhagavatam";
export type TraditionPreference = Tradition | "both";

export interface Pairing {
  id: number;
  tradition: Tradition;
  stoic_theme: string;
  stoic_concept: string;
  stoic_source_ref: string | null;
  verse_ref: string;
  verse_paraphrase: string;
  translation_source_note: string | null;
  bridge_prompt: string;
  origin: "seed" | "user" | "ai_explore";
  created_at: string;
  updated_at: string;
}

/** Reads the single-row tradition preference. Duplicated narrowly here to
 * avoid a premature dependency on settingsService, which lands in Step 6. */
function getTraditionPreference(): TraditionPreference {
  const row = db
    .prepare("SELECT tradition_preference FROM settings WHERE id = 1")
    .get() as { tradition_preference: TraditionPreference };
  return row.tradition_preference;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

/**
 * Cycles through pairings by (day-of-year - 1) % count, ordered by id.
 * Filters by tradition first when the preference isn't 'both', so each
 * tradition's own cycle lengthens independently as pairings are added.
 */
export function getTodaysPairing(date: Date = new Date()): Pairing | null {
  const preference = getTraditionPreference();
  const whereClause = preference !== "both" ? "WHERE tradition = ?" : "";
  const params = preference !== "both" ? [preference] : [];

  const { count } = db
    .prepare(`SELECT COUNT(*) AS count FROM pairings ${whereClause}`)
    .get(...params) as { count: number };
  if (count === 0) return null;

  const offset = (dayOfYear(date) - 1) % count;
  const pairing = db
    .prepare(`SELECT * FROM pairings ${whereClause} ORDER BY id LIMIT 1 OFFSET ?`)
    .get(...params, offset) as Pairing;
  return pairing;
}

export function listPairings(tradition?: TraditionPreference): Pairing[] {
  if (tradition && tradition !== "both") {
    return db
      .prepare("SELECT * FROM pairings WHERE tradition = ? ORDER BY id")
      .all(tradition) as Pairing[];
  }
  return db.prepare("SELECT * FROM pairings ORDER BY id").all() as Pairing[];
}

export function getPairingById(id: number): Pairing | undefined {
  return db.prepare("SELECT * FROM pairings WHERE id = ?").get(id) as Pairing | undefined;
}

export interface NewPairing {
  tradition: Tradition;
  stoic_theme: string;
  stoic_concept: string;
  stoic_source_ref?: string;
  verse_ref: string;
  verse_paraphrase: string;
  translation_source_note?: string;
  bridge_prompt: string;
  origin?: "user" | "ai_explore";
}

export function createPairing(pairing: NewPairing): Pairing {
  const result = db
    .prepare(
      `INSERT INTO pairings
        (tradition, stoic_theme, stoic_concept, stoic_source_ref, verse_ref,
         verse_paraphrase, translation_source_note, bridge_prompt, origin)
       VALUES
        (@tradition, @stoic_theme, @stoic_concept, @stoic_source_ref, @verse_ref,
         @verse_paraphrase, @translation_source_note, @bridge_prompt, @origin)`
    )
    .run({
      stoic_source_ref: null,
      translation_source_note: null,
      origin: "user",
      ...pairing,
    });
  return getPairingById(result.lastInsertRowid as number)!;
}

export function updatePairing(id: number, fields: Partial<NewPairing>): Pairing | undefined {
  const existing = getPairingById(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...fields };
  db.prepare(
    `UPDATE pairings SET
      tradition = @tradition, stoic_theme = @stoic_theme, stoic_concept = @stoic_concept,
      stoic_source_ref = @stoic_source_ref, verse_ref = @verse_ref,
      verse_paraphrase = @verse_paraphrase, translation_source_note = @translation_source_note,
      bridge_prompt = @bridge_prompt, updated_at = datetime('now')
     WHERE id = @id`
  ).run({ ...merged, id });
  return getPairingById(id);
}

export function deletePairing(id: number): boolean {
  const result = db.prepare("DELETE FROM pairings WHERE id = ?").run(id);
  return result.changes > 0;
}
