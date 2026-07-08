import { Router } from "express";
import { getEntryByDate, searchEntries, upsertEntry } from "../services/journalService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const journalRouter = Router();

journalRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { query, from, to } = req.query as { query?: string; from?: string; to?: string };
    res.json(await searchEntries({ query, from, to }));
  })
);

journalRouter.get(
  "/:date",
  asyncHandler(async (req, res) => {
    const entry = await getEntryByDate(req.params.date);
    if (!entry) {
      res.status(404).json({ error: "No entry for this date." });
      return;
    }
    res.json(entry);
  })
);

journalRouter.put(
  "/:date",
  asyncHandler(async (req, res) => {
    const { reflection_text, pairing_id } = req.body as {
      reflection_text?: string;
      pairing_id?: number | null;
    };
    if (!reflection_text || !reflection_text.trim()) {
      res.status(400).json({ error: "reflection_text is required." });
      return;
    }
    const entry = await upsertEntry(req.params.date, reflection_text, pairing_id ?? null);
    res.json(entry);
  })
);
