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

export interface JournalEntryWithPairing extends JournalEntry {
  stoic_concept: string | null;
  verse_ref: string | null;
}

export interface JournalSearchParams {
  query?: string;
  from?: string;
  to?: string;
}

/** Browse/search journal entries, newest first, optionally filtered by text and date range. */
export function searchEntries(params: JournalSearchParams): JournalEntryWithPairing[] {
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (params.query) {
    conditions.push("je.reflection_text LIKE ?");
    args.push(`%${params.query}%`);
  }
  if (params.from) {
    conditions.push("je.entry_date >= ?");
    args.push(params.from);
  }
  if (params.to) {
    conditions.push("je.entry_date <= ?");
    args.push(params.to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT je.*, p.stoic_concept AS stoic_concept, p.verse_ref AS verse_ref
       FROM journal_entries je
       LEFT JOIN pairings p ON p.id = je.pairing_id
       ${whereClause}
       ORDER BY je.entry_date DESC`
    )
    .all(...args) as JournalEntryWithPairing[];
}
