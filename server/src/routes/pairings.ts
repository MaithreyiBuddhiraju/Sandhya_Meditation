import { Router } from "express";
import {
  createPairing,
  deletePairing,
  getPairingById,
  getTodaysPairing,
  listPairings,
  updatePairing,
} from "../services/pairingService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const pairingsRouter = Router();

pairingsRouter.get(
  "/today",
  asyncHandler(async (req, res) => {
    const date = req.query.date as string | undefined;
    if (!date) {
      res.status(400).json({ error: "date query parameter is required." });
      return;
    }
    const pairing = await getTodaysPairing(date);
    if (!pairing) {
      res.status(404).json({ error: "No pairings available." });
      return;
    }
    res.json(pairing);
  })
);

pairingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const tradition = req.query.tradition as string | undefined;
    res.json(await listPairings(tradition as "gita" | "devi_bhagavatam" | "both" | undefined));
  })
);

pairingsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const pairing = await getPairingById(Number(req.params.id));
    if (!pairing) {
      res.status(404).json({ error: "Pairing not found." });
      return;
    }
    res.json(pairing);
  })
);

pairingsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const pairing = await createPairing(req.body);
    res.status(201).json(pairing);
  })
);

pairingsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const pairing = await updatePairing(Number(req.params.id), req.body);
    if (!pairing) {
      res.status(404).json({ error: "Pairing not found." });
      return;
    }
    res.json(pairing);
  })
);

pairingsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await deletePairing(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Pairing not found." });
      return;
    }
    res.status(204).send();
  })
);
