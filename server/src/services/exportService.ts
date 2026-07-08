import { db } from "../db/connection.js";
import type { JournalEntryWithPairing } from "./journalService.js";
import type { SortedThought } from "./thoughtService.js";
import { BUCKET_LABELS } from "../content/bucketReframes.js";

async function allJournalEntries(): Promise<JournalEntryWithPairing[]> {
  const result = await db.execute(
    `SELECT je.*, p.stoic_concept AS stoic_concept, p.verse_ref AS verse_ref
       FROM journal_entries je
       LEFT JOIN pairings p ON p.id = je.pairing_id
       ORDER BY je.entry_date DESC`
  );
  return result.rows.map((row) => ({ ...row }) as unknown as JournalEntryWithPairing);
}

async function allSortedThoughts(): Promise<SortedThought[]> {
  const result = await db.execute(
    "SELECT * FROM sorted_thoughts ORDER BY entry_date DESC, id DESC"
  );
  return result.rows.map((row) => ({ ...row }) as unknown as SortedThought);
}

/** Renders all journal entries and sorted thoughts as a single Markdown document. */
export async function exportToMarkdown(): Promise<string> {
  const [journalEntries, sortedThoughts] = await Promise.all([
    allJournalEntries(),
    allSortedThoughts(),
  ]);
  const generatedAt = new Date().toISOString();

  const lines: string[] = [];
  lines.push("# Sandhya Export");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Journal Entries");
  lines.push("");

  if (journalEntries.length === 0) {
    lines.push("_No journal entries yet._");
  }
  for (const entry of journalEntries) {
    lines.push(`### ${entry.entry_date}`);
    if (entry.stoic_concept) {
      lines.push(`**Pairing:** ${entry.stoic_concept} (${entry.verse_ref})`);
      lines.push("");
    }
    lines.push(entry.reflection_text);
    lines.push("");
  }

  lines.push("## Sorted Thoughts");
  lines.push("");

  if (sortedThoughts.length === 0) {
    lines.push("_Nothing sorted yet._");
  }
  for (const thought of sortedThoughts) {
    lines.push(`### ${thought.entry_date} — ${BUCKET_LABELS[thought.bucket]}`);
    lines.push("");
    lines.push(`**Worry:** ${thought.worry_text}`);
    lines.push("");
    lines.push(`**Stoic reframe:** ${thought.stoic_reframe}`);
    lines.push("");
    lines.push(`**Gita reframe:** ${thought.gita_reframe}`);
    if (thought.outcome_note) {
      lines.push("");
      lines.push(`**Outcome:** ${thought.outcome_note}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
