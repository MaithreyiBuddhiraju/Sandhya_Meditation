import { Router } from "express";
import {
  createPairing,
  deletePairing,
  getPairingById,
  getTodaysPairing,
  listPairings,
  updatePairing,
} from "../services/pairingService.js";

export const pairingsRouter = Router();

pairingsRouter.get("/today", (_req, res) => {
  const pairing = getTodaysPairing();
  if (!pairing) {
    res.status(404).json({ error: "No pairings available." });
    return;
  }
  res.json(pairing);
});

pairingsRouter.get("/", (req, res) => {
  const tradition = req.query.tradition as string | undefined;
  res.json(listPairings(tradition as "gita" | "devi_bhagavatam" | "both" | undefined));
});

pairingsRouter.get("/:id", (req, res) => {
  const pairing = getPairingById(Number(req.params.id));
  if (!pairing) {
    res.status(404).json({ error: "Pairing not found." });
    return;
  }
  res.json(pairing);
});

pairingsRouter.post("/", (req, res) => {
  const pairing = createPairing(req.body);
  res.status(201).json(pairing);
});

pairingsRouter.put("/:id", (req, res) => {
  const pairing = updatePairing(Number(req.params.id), req.body);
  if (!pairing) {
    res.status(404).json({ error: "Pairing not found." });
    return;
  }
  res.json(pairing);
});

pairingsRouter.delete("/:id", (req, res) => {
  const deleted = deletePairing(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Pairing not found." });
    return;
  }
  res.status(204).send();
});
