import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SeedPairing {
  tradition: "gita" | "devi_bhagavatam";
  stoic_concept: string;
  stoic_theme: string;
  stoic_source_ref: string;
  verse_ref: string;
  verse_paraphrase: string;
  translation_source_note: string;
  bridge_prompt: string;
}

const INSERT_SQL = `
  INSERT INTO pairings
    (tradition, stoic_theme, stoic_concept, stoic_source_ref, verse_ref,
     verse_paraphrase, translation_source_note, bridge_prompt, origin)
  VALUES
    (:tradition, :stoic_theme, :stoic_concept, :stoic_source_ref, :verse_ref,
     :verse_paraphrase, :translation_source_note, :bridge_prompt, 'seed')
`;

/** Idempotent: only inserts seed pairings if the table is currently empty. */
export async function seedPairings(): Promise<void> {
  const countResult = await db.execute("SELECT COUNT(*) AS count FROM pairings");
  const count = Number((countResult.rows[0] as unknown as { count: number }).count);
  if (count > 0) return;

  const seedPath = path.join(__dirname, "pairings.seed.json");
  const seedData: SeedPairing[] = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  await db.batch(
    seedData.map((row) => ({ sql: INSERT_SQL, args: { ...row } })),
    "write"
  );

  console.log(`Seeded ${seedData.length} pairings.`);
}
