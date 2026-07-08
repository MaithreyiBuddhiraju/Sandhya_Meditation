import { db } from "../db/connection.js";
import { bucketReframes, type Bucket, type BucketReframe } from "../content/bucketReframes.js";

export interface SortedThought {
  id: number;
  entry_date: string;
  created_at: string;
  worry_text: string;
  bucket: Bucket;
  stoic_reframe: string;
  stoic_concept_ref: string | null;
  gita_reframe: string;
  gita_concept_ref: string | null;
  source: "manual" | "ai_assisted";
  outcome_note: string | null;
  outcome_recorded_at: string | null;
  updated_at: string;
}

export interface CreateThoughtParams {
  entryDate: string;
  worryText: string;
  bucket: Bucket;
  /** AI-assist (Step 7) supplies its own reframe; omit to use the static baseline. */
  customReframe?: BucketReframe;
}

export async function createSortedThought(params: CreateThoughtParams): Promise<SortedThought> {
  const reframe = params.customReframe ?? bucketReframes[params.bucket];
  const source = params.customReframe ? "ai_assisted" : "manual";

  const result = await db.execute({
    sql: `INSERT INTO sorted_thoughts
        (entry_date, worry_text, bucket, stoic_reframe, stoic_concept_ref,
         gita_reframe, gita_concept_ref, source)
       VALUES (:entry_date, :worry_text, :bucket, :stoic_reframe, :stoic_concept_ref,
               :gita_reframe, :gita_concept_ref, :source)`,
    args: {
      entry_date: params.entryDate,
      worry_text: params.worryText,
      bucket: params.bucket,
      stoic_reframe: reframe.stoic_reframe,
      stoic_concept_ref: reframe.stoic_concept_ref,
      gita_reframe: reframe.gita_reframe,
      gita_concept_ref: reframe.gita_concept_ref,
      source,
    },
  });

  return (await getThoughtById(Number(result.lastInsertRowid)))!;
}

export async function getThoughtById(id: number): Promise<SortedThought | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM sorted_thoughts WHERE id = ?",
    args: [id],
  });
  return result.rows[0] ? ({ ...result.rows[0] } as unknown as SortedThought) : undefined;
}

export interface ThoughtSearchParams {
  query?: string;
  bucket?: Bucket;
  from?: string;
  to?: string;
}

export async function searchThoughts(params: ThoughtSearchParams): Promise<SortedThought[]> {
  const conditions: string[] = [];
  const args: string[] = [];

  if (params.query) {
    conditions.push("worry_text LIKE ?");
    args.push(`%${params.query}%`);
  }
  if (params.bucket) {
    conditions.push("bucket = ?");
    args.push(params.bucket);
  }
  if (params.from) {
    conditions.push("entry_date >= ?");
    args.push(params.from);
  }
  if (params.to) {
    conditions.push("entry_date <= ?");
    args.push(params.to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT * FROM sorted_thoughts ${whereClause} ORDER BY entry_date DESC, id DESC`,
    args,
  });
  return result.rows.map((row) => ({ ...row }) as unknown as SortedThought);
}

export async function recordOutcome(
  id: number,
  outcomeNote: string
): Promise<SortedThought | undefined> {
  const existing = await getThoughtById(id);
  if (!existing) return undefined;
  await db.execute({
    sql: `UPDATE sorted_thoughts
       SET outcome_note = ?, outcome_recorded_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ?`,
    args: [outcomeNote, id],
  });
  return getThoughtById(id);
}
