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

/** Idempotent: only inserts seed pairings if the table is currently empty. */
export function seedPairings(): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM pairings").get() as {
    count: number;
  };
  if (count > 0) return;

  const seedPath = path.join(__dirname, "pairings.seed.json");
  const seedData: SeedPairing[] = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  const insert = db.prepare(`
    INSERT INTO pairings
      (tradition, stoic_theme, stoic_concept, stoic_source_ref, verse_ref,
       verse_paraphrase, translation_source_note, bridge_prompt, origin)
    VALUES
      (@tradition, @stoic_theme, @stoic_concept, @stoic_source_ref, @verse_ref,
       @verse_paraphrase, @translation_source_note, @bridge_prompt, 'seed')
  `);

  const insertAll = db.transaction((rows: SeedPairing[]) => {
    for (const row of rows) insert.run(row);
  });

  insertAll(seedData);
  console.log(`Seeded ${seedData.length} pairings.`);
}
