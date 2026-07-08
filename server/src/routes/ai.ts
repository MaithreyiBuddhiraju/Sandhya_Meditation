import { Router } from "express";
import { isAiConfigured } from "../services/aiConfig.js";
import {
  getBridgeExplanation,
  getExploreSuggestions,
  getSortAssist,
  getWeeklyDigest,
} from "../services/aiFeatureService.js";

export const aiRouter = Router();

aiRouter.get("/status", (_req, res) => {
  res.json({ configured: isAiConfigured() });
});

aiRouter.post("/bridge", async (req, res) => {
  if (!isAiConfigured()) {
    res.json({ configured: false, cached: false, data: null });
    return;
  }
  const { pairing_id } = req.body as { pairing_id?: number };
  if (!pairing_id) {
    res.status(400).json({ error: "pairing_id is required." });
    return;
  }
  try {
    const result = await getBridgeExplanation(pairing_id);
    if (!result) {
      res.status(404).json({ error: "Pairing not found." });
      return;
    }
    res.json({ configured: true, cached: result.cached, data: result.data });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "AI request failed." });
  }
});

aiRouter.post("/explore", async (req, res) => {
  if (!isAiConfigured()) {
    res.json({ configured: false, cached: false, data: null });
    return;
  }
  const { concept_text } = req.body as { concept_text?: string };
  if (!concept_text?.trim()) {
    res.status(400).json({ error: "concept_text is required." });
    return;
  }
  try {
    const result = await getExploreSuggestions(concept_text);
    res.json({ configured: true, cached: result.cached, data: result.data });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "AI request failed." });
  }
});

aiRouter.post("/thoughts/sort-assist", async (req, res) => {
  if (!isAiConfigured()) {
    res.json({ configured: false, cached: false, data: null });
    return;
  }
  const { worry_text } = req.body as { worry_text?: string };
  if (!worry_text?.trim()) {
    res.status(400).json({ error: "worry_text is required." });
    return;
  }
  try {
    const result = await getSortAssist(worry_text);
    res.json({ configured: true, cached: result.cached, data: result.data });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "AI request failed." });
  }
});

aiRouter.post("/weekly-digest", async (_req, res) => {
  if (!isAiConfigured()) {
    res.json({ configured: false, cached: false, data: null });
    return;
  }
  try {
    const result = await getWeeklyDigest();
    if ("empty" in result) {
      res.json({ configured: true, cached: false, data: null, empty: true });
      return;
    }
    res.json({ configured: true, cached: result.cached, data: result.data });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "AI request failed." });
  }
});
