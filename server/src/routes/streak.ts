import { Router } from "express";
import { getStreakSummary } from "../services/streakService.js";

export const streakRouter = Router();

streakRouter.get("/", (req, res) => {
  const date = req.query.date as string | undefined;
  if (!date) {
    res.status(400).json({ error: "date query parameter (client-local YYYY-MM-DD) is required." });
    return;
  }
  res.json(getStreakSummary(date));
});
