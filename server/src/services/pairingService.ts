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
async function getTraditionPreference(): Promise<TraditionPreference> {
  const result = await db.execute("SELECT tradition_preference FROM settings WHERE id = 1");
  return (result.rows[0] as unknown as { tradition_preference: TraditionPreference })
    .tradition_preference;
}

/**
 * Diffing two local Date objects' getTime() values is not DST-safe: a
 * transition (e.g. "spring forward") between Jan 1 and the target date
 * makes the elapsed real time slightly less than N whole days, undercounting
 * by one. Date.UTC() sidesteps this — it maps the same calendar y/m/d to a
 * UTC timestamp, which never observes DST, so the diff is always an exact
 * multiple of 86,400,000ms regardless of the runtime's local timezone.
 */
function dayOfYear(date: Date): number {
  const utcTarget = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcStart = Date.UTC(date.getFullYear(), 0, 1);
  return Math.floor((utcTarget - utcStart) / 86_400_000) + 1;
}

/**
 * Cycles through pairings by (day-of-year - 1) % count, ordered by id.
 * Filters by tradition first when the preference isn't 'both', so each
 * tradition's own cycle lengthens independently as pairings are added.
 *
 * dateStr is the client-local YYYY-MM-DD date — never inferred from the
 * server clock, since a serverless function's clock runs in UTC and would
 * drift a pairing behind for users east of UTC until the server's day rolls
 * over. Parsed into local Date components (not `new Date(isoString)`, which
 * parses as UTC) so dayOfYear reflects the client's actual calendar day.
 */
export async function getTodaysPairing(dateStr: string): Promise<Pairing | null> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const preference = await getTraditionPreference();
  const whereClause = preference !== "both" ? "WHERE tradition = :tradition" : "";
  const args: Record<string, string | number> =
    preference !== "both" ? { tradition: preference } : {};

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) AS count FROM pairings ${whereClause}`,
    args,
  });
  const count = Number((countResult.rows[0] as unknown as { count: number }).count);
  if (count === 0) return null;

  const offset = (dayOfYear(date) - 1) % count;
  const result = await db.execute({
    sql: `SELECT * FROM pairings ${whereClause} ORDER BY id LIMIT 1 OFFSET :offset`,
    args: { ...args, offset },
  });
  return { ...result.rows[0] } as unknown as Pairing;
}

export async function listPairings(tradition?: TraditionPreference): Promise<Pairing[]> {
  const result =
    tradition && tradition !== "both"
      ? await db.execute({
          sql: "SELECT * FROM pairings WHERE tradition = :tradition ORDER BY id",
          args: { tradition },
        })
      : await db.execute("SELECT * FROM pairings ORDER BY id");
  return result.rows.map((row) => ({ ...row }) as unknown as Pairing);
}

export async function getPairingById(id: number): Promise<Pairing | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM pairings WHERE id = :id",
    args: { id },
  });
  return result.rows[0] ? ({ ...result.rows[0] } as unknown as Pairing) : undefined;
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

export async function createPairing(pairing: NewPairing): Promise<Pairing> {
  const args = {
    stoic_source_ref: null,
    translation_source_note: null,
    origin: "user",
    ...pairing,
  };
  const result = await db.execute({
    sql: `INSERT INTO pairings
        (tradition, stoic_theme, stoic_concept, stoic_source_ref, verse_ref,
         verse_paraphrase, translation_source_note, bridge_prompt, origin)
       VALUES
        (:tradition, :stoic_theme, :stoic_concept, :stoic_source_ref, :verse_ref,
         :verse_paraphrase, :translation_source_note, :bridge_prompt, :origin)`,
    args,
  });
  return (await getPairingById(Number(result.lastInsertRowid)))!;
}

export async function updatePairing(
  id: number,
  fields: Partial<NewPairing>
): Promise<Pairing | undefined> {
  const existing = await getPairingById(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...fields };
  // libSQL errors on args keys the SQL doesn't reference, so pick exactly
  // the columns this UPDATE uses — no spreading extra fields (e.g. timestamps).
  await db.execute({
    sql: `UPDATE pairings SET
      tradition = :tradition, stoic_theme = :stoic_theme, stoic_concept = :stoic_concept,
      stoic_source_ref = :stoic_source_ref, verse_ref = :verse_ref,
      verse_paraphrase = :verse_paraphrase, translation_source_note = :translation_source_note,
      bridge_prompt = :bridge_prompt, updated_at = datetime('now')
     WHERE id = :id`,
    args: {
      id,
      tradition: merged.tradition,
      stoic_theme: merged.stoic_theme,
      stoic_concept: merged.stoic_concept,
      stoic_source_ref: merged.stoic_source_ref,
      verse_ref: merged.verse_ref,
      verse_paraphrase: merged.verse_paraphrase,
      translation_source_note: merged.translation_source_note,
      bridge_prompt: merged.bridge_prompt,
    },
  });
  return getPairingById(id);
}

export async function deletePairing(id: number): Promise<boolean> {
  const result = await db.execute({ sql: "DELETE FROM pairings WHERE id = :id", args: { id } });
  return result.rowsAffected > 0;
}
