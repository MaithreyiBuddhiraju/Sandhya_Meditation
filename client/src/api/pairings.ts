import { apiClient } from "./client";
import type { Pairing } from "../types";

export interface NewPairing {
  tradition: Pairing["tradition"];
  stoic_concept: string;
  stoic_theme: string;
  stoic_source_ref?: string;
  verse_ref: string;
  verse_paraphrase: string;
  translation_source_note?: string;
  bridge_prompt: string;
  origin?: "user" | "ai_explore";
}

export const pairingsApi = {
  getToday: (date: string) => apiClient.get<Pairing>(`/pairings/today?date=${date}`),
  create: (pairing: NewPairing) => apiClient.post<Pairing>("/pairings", pairing),
};
