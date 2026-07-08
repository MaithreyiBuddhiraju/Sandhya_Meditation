import { db } from "../db/connection.js";

export interface JournalEntry {
  id: number;
  entry_date: string;
  pairing_id: number | null;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export async function getEntryByDate(entryDate: string): Promise<JournalEntry | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM journal_entries WHERE entry_date = ?",
    args: [entryDate],
  });
  return result.rows[0] ? ({ ...result.rows[0] } as unknown as JournalEntry) : undefined;
}

/** Upserts the single reflection for a calendar date. */
export async function upsertEntry(
  entryDate: string,
  reflectionText: string,
  pairingId: number | null
): Promise<JournalEntry> {
  const existing = await getEntryByDate(entryDate);
  if (existing) {
    await db.execute({
      sql: `UPDATE journal_entries
              SET reflection_text = ?, pairing_id = ?, updated_at = datetime('now')
            WHERE entry_date = ?`,
      args: [reflectionText, pairingId, entryDate],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO journal_entries (entry_date, pairing_id, reflection_text)
            VALUES (?, ?, ?)`,
      args: [entryDate, pairingId, reflectionText],
    });
  }
  return (await getEntryByDate(entryDate))!;
}

export async function listEntryDates(): Promise<string[]> {
  const result = await db.execute("SELECT entry_date FROM journal_entries");
  return result.rows.map((row) => (row as unknown as { entry_date: string }).entry_date);
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
export async function searchEntries(
  params: JournalSearchParams
): Promise<JournalEntryWithPairing[]> {
  const conditions: string[] = [];
  const args: string[] = [];

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

  const result = await db.execute({
    sql: `SELECT je.*, p.stoic_concept AS stoic_concept, p.verse_ref AS verse_ref
          FROM journal_entries je
          LEFT JOIN pairings p ON p.id = je.pairing_id
          ${whereClause}
          ORDER BY je.entry_date DESC`,
    args,
  });
  return result.rows.map((row) => ({ ...row }) as unknown as JournalEntryWithPairing);
}
