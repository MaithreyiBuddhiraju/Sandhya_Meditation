import { apiClient } from "./client";
import type { StreakSummary } from "../types";

export const streakApi = {
  getSummary: (date: string) => apiClient.get<StreakSummary>(`/streak?date=${date}`),
};
