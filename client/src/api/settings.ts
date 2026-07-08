import { apiClient } from "./client";
import type { Settings, TraditionPreference } from "../types";

export const settingsApi = {
  get: () => apiClient.get<Settings>("/settings"),
  updateTraditionPreference: (preference: TraditionPreference) =>
    apiClient.put<Settings>("/settings", { tradition_preference: preference }),
};
