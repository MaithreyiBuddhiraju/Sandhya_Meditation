import { Router } from "express";
import type { Bucket } from "../content/bucketReframes.js";
import {
  createSortedThought,
  getThoughtById,
  recordOutcome,
  searchThoughts,
} from "../services/thoughtService.js";

const VALID_BUCKETS: Bucket[] = ["full_control", "partial_control", "no_control"];

export const thoughtsRouter = Router();

thoughtsRouter.get("/", (req, res) => {
  const { query, bucket, from, to } = req.query as {
    query?: string;
    bucket?: Bucket;
    from?: string;
    to?: string;
  };
  res.json(searchThoughts({ query, bucket, from, to }));
});

thoughtsRouter.get("/:id", (req, res) => {
  const thought = getThoughtById(Number(req.params.id));
  if (!thought) {
    res.status(404).json({ error: "Sorted thought not found." });
    return;
  }
  res.json(thought);
});

thoughtsRouter.post("/", (req, res) => {
  const { entry_date, worry_text, bucket } = req.body as {
    entry_date?: string;
    worry_text?: string;
    bucket?: Bucket;
  };

  if (!entry_date || !worry_text?.trim() || !bucket) {
    res.status(400).json({ error: "entry_date, worry_text, and bucket are required." });
    return;
  }
  if (!VALID_BUCKETS.includes(bucket)) {
    res.status(400).json({ error: `bucket must be one of: ${VALID_BUCKETS.join(", ")}` });
    return;
  }

  const thought = createSortedThought({ entryDate: entry_date, worryText: worry_text, bucket });
  res.status(201).json(thought);
});

thoughtsRouter.put("/:id/outcome", (req, res) => {
  const { outcome_note } = req.body as { outcome_note?: string };
  if (!outcome_note?.trim()) {
    res.status(400).json({ error: "outcome_note is required." });
    return;
  }
  const thought = recordOutcome(Number(req.params.id), outcome_note);
  if (!thought) {
    res.status(404).json({ error: "Sorted thought not found." });
    return;
  }
  res.json(thought);
});
