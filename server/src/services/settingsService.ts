import { db } from "../db/connection.js";
import type { TraditionPreference } from "./pairingService.js";
import { isAiConfigured } from "./aiConfig.js";

export interface Settings {
  tradition_preference: TraditionPreference;
  ai_configured: boolean;
}

export function getSettings(): Settings {
  const row = db
    .prepare("SELECT tradition_preference FROM settings WHERE id = 1")
    .get() as { tradition_preference: TraditionPreference };
  return { tradition_preference: row.tradition_preference, ai_configured: isAiConfigured() };
}

export function updateTraditionPreference(preference: TraditionPreference): Settings {
  db.prepare(
    "UPDATE settings SET tradition_preference = ?, updated_at = datetime('now') WHERE id = 1"
  ).run(preference);
  return getSettings();
}
