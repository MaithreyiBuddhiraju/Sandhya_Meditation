import { db } from "../db/connection.js";
import type { TraditionPreference } from "./pairingService.js";
import { isAiConfigured } from "./aiConfig.js";

export interface Settings {
  tradition_preference: TraditionPreference;
  ai_configured: boolean;
}

export async function getSettings(): Promise<Settings> {
  const result = await db.execute("SELECT tradition_preference FROM settings WHERE id = 1");
  const row = result.rows[0] as unknown as { tradition_preference: TraditionPreference };
  return { tradition_preference: row.tradition_preference, ai_configured: isAiConfigured() };
}

export async function updateTraditionPreference(
  preference: TraditionPreference
): Promise<Settings> {
  await db.execute({
    sql: "UPDATE settings SET tradition_preference = ?, updated_at = datetime('now') WHERE id = 1",
    args: [preference],
  });
  return getSettings();
}
