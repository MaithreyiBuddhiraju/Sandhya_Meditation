import { Router } from "express";
import { getSettings, updateTraditionPreference } from "../services/settingsService.js";
import { exportToMarkdown } from "../services/exportService.js";
import type { TraditionPreference } from "../services/pairingService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const VALID_PREFERENCES: TraditionPreference[] = ["gita", "devi_bhagavatam", "both"];

export const settingsRouter = Router();

settingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getSettings());
  })
);

settingsRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const { tradition_preference } = req.body as { tradition_preference?: TraditionPreference };
    if (!tradition_preference || !VALID_PREFERENCES.includes(tradition_preference)) {
      res
        .status(400)
        .json({ error: `tradition_preference must be one of: ${VALID_PREFERENCES.join(", ")}` });
      return;
    }
    res.json(await updateTraditionPreference(tradition_preference));
  })
);

settingsRouter.get(
  "/export",
  asyncHandler(async (_req, res) => {
    const markdown = await exportToMarkdown();
    const filename = `sandhya-export-${new Date().toISOString().slice(0, 10)}.md`;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(markdown);
  })
);
