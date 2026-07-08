import { db } from "../db/connection.js";
import type { TraditionPreference } from "./pairingService.js";

export interface Settings {
  tradition_preference: TraditionPreference;
  ai_configured: boolean;
}

/** The API key lives only in server/.env — never read from or written to the DB. */
function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
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
