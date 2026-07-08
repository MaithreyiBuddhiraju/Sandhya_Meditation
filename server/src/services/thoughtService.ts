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

export function createSortedThought(params: CreateThoughtParams): SortedThought {
  const reframe = params.customReframe ?? bucketReframes[params.bucket];
  const source = params.customReframe ? "ai_assisted" : "manual";

  const result = db
    .prepare(
      `INSERT INTO sorted_thoughts
        (entry_date, worry_text, bucket, stoic_reframe, stoic_concept_ref,
         gita_reframe, gita_concept_ref, source)
       VALUES (@entry_date, @worry_text, @bucket, @stoic_reframe, @stoic_concept_ref,
               @gita_reframe, @gita_concept_ref, @source)`
    )
    .run({
      entry_date: params.entryDate,
      worry_text: params.worryText,
      bucket: params.bucket,
      stoic_reframe: reframe.stoic_reframe,
      stoic_concept_ref: reframe.stoic_concept_ref,
      gita_reframe: reframe.gita_reframe,
      gita_concept_ref: reframe.gita_concept_ref,
      source,
    });

  return getThoughtById(result.lastInsertRowid as number)!;
}

export function getThoughtById(id: number): SortedThought | undefined {
  return db.prepare("SELECT * FROM sorted_thoughts WHERE id = ?").get(id) as
    | SortedThought
    | undefined;
}

export interface ThoughtSearchParams {
  query?: string;
  bucket?: Bucket;
  from?: string;
  to?: string;
}

export function searchThoughts(params: ThoughtSearchParams): SortedThought[] {
  const conditions: string[] = [];
  const args: unknown[] = [];

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

  return db
    .prepare(`SELECT * FROM sorted_thoughts ${whereClause} ORDER BY entry_date DESC, id DESC`)
    .all(...args) as SortedThought[];
}

export function recordOutcome(id: number, outcomeNote: string): SortedThought | undefined {
  const existing = getThoughtById(id);
  if (!existing) return undefined;
  db.prepare(
    `UPDATE sorted_thoughts
       SET outcome_note = ?, outcome_recorded_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ?`
  ).run(outcomeNote, id);
  return getThoughtById(id);
}
