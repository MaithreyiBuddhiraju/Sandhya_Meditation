import { db } from "../db/connection.js";

export interface JournalEntry {
  id: number;
  entry_date: string;
  pairing_id: number | null;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export function getEntryByDate(entryDate: string): JournalEntry | undefined {
  return db
    .prepare("SELECT * FROM journal_entries WHERE entry_date = ?")
    .get(entryDate) as JournalEntry | undefined;
}

/** Upserts the single reflection for a calendar date. */
export function upsertEntry(
  entryDate: string,
  reflectionText: string,
  pairingId: number | null
): JournalEntry {
  const existing = getEntryByDate(entryDate);
  if (existing) {
    db.prepare(
      `UPDATE journal_entries
         SET reflection_text = ?, pairing_id = ?, updated_at = datetime('now')
       WHERE entry_date = ?`
    ).run(reflectionText, pairingId, entryDate);
  } else {
    db.prepare(
      `INSERT INTO journal_entries (entry_date, pairing_id, reflection_text)
       VALUES (?, ?, ?)`
    ).run(entryDate, pairingId, reflectionText);
  }
  return getEntryByDate(entryDate)!;
}

export function listEntryDates(): string[] {
  return (
    db.prepare("SELECT entry_date FROM journal_entries").all() as { entry_date: string }[]
  ).map((row) => row.entry_date);
}
