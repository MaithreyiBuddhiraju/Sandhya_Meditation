import { apiClient } from "./client";
import type { JournalEntry } from "../types";

export const journalApi = {
  getByDate: (date: string) => apiClient.get<JournalEntry>(`/journal/${date}`),
  save: (date: string, reflectionText: string, pairingId: number | null) =>
    apiClient.put<JournalEntry>(`/journal/${date}`, {
      reflection_text: reflectionText,
      pairing_id: pairingId,
    }),
};
