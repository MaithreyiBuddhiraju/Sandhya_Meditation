import { apiClient } from "./client";
import type { JournalEntry, JournalEntryWithPairing } from "../types";

export interface JournalSearchParams {
  query?: string;
  from?: string;
  to?: string;
}

export const journalApi = {
  getByDate: (date: string) => apiClient.get<JournalEntry>(`/journal/${date}`),
  save: (date: string, reflectionText: string, pairingId: number | null) =>
    apiClient.put<JournalEntry>(`/journal/${date}`, {
      reflection_text: reflectionText,
      pairing_id: pairingId,
    }),
  search: (params: JournalSearchParams) => {
    const search = new URLSearchParams();
    if (params.query) search.set("query", params.query);
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return apiClient.get<JournalEntryWithPairing[]>(`/journal${suffix}`);
  },
};
