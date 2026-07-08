import { Router } from "express";
import { getEntryByDate, searchEntries, upsertEntry } from "../services/journalService.js";

export const journalRouter = Router();

journalRouter.get("/", (req, res) => {
  const { query, from, to } = req.query as { query?: string; from?: string; to?: string };
  res.json(searchEntries({ query, from, to }));
});

journalRouter.get("/:date", (req, res) => {
  const entry = getEntryByDate(req.params.date);
  if (!entry) {
    res.status(404).json({ error: "No entry for this date." });
    return;
  }
  res.json(entry);
});

journalRouter.put("/:date", (req, res) => {
  const { reflection_text, pairing_id } = req.body as {
    reflection_text?: string;
    pairing_id?: number | null;
  };
  if (!reflection_text || !reflection_text.trim()) {
    res.status(400).json({ error: "reflection_text is required." });
    return;
  }
  const entry = upsertEntry(req.params.date, reflection_text, pairing_id ?? null);
  res.json(entry);
});
