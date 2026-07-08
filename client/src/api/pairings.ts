import { apiClient } from "./client";
import type { Pairing } from "../types";

export const pairingsApi = {
  getToday: () => apiClient.get<Pairing>("/pairings/today"),
};
