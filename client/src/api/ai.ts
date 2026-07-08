import { apiClient } from "./client";
import type {
  AiEnvelope,
  BridgeResult,
  ExploreSuggestion,
  SortAssistResult,
  WeeklyDigestResult,
} from "../types";

export const aiApi = {
  getStatus: () => apiClient.get<{ configured: boolean }>("/ai/status"),
  getBridge: (pairingId: number) =>
    apiClient.post<AiEnvelope<BridgeResult>>("/ai/bridge", { pairing_id: pairingId }),
  explore: (conceptText: string) =>
    apiClient.post<AiEnvelope<ExploreSuggestion[]>>("/ai/explore", { concept_text: conceptText }),
  sortAssist: (worryText: string) =>
    apiClient.post<AiEnvelope<SortAssistResult>>("/ai/thoughts/sort-assist", {
      worry_text: worryText,
    }),
  weeklyDigest: () => apiClient.post<AiEnvelope<WeeklyDigestResult>>("/ai/weekly-digest"),
};
