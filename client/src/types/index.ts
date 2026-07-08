export type Tradition = "gita" | "devi_bhagavatam";
export type TraditionPreference = Tradition | "both";

export interface Pairing {
  id: number;
  tradition: Tradition;
  stoic_theme: string;
  stoic_concept: string;
  stoic_source_ref: string | null;
  verse_ref: string;
  verse_paraphrase: string;
  translation_source_note: string | null;
  bridge_prompt: string;
  origin: "seed" | "user" | "ai_explore";
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  entry_date: string;
  pairing_id: number | null;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryWithPairing extends JournalEntry {
  stoic_concept: string | null;
  verse_ref: string | null;
}

export type DiyaState = "lit" | "grace" | "missed" | "future";

export interface DayState {
  date: string;
  state: DiyaState;
  isToday: boolean;
}

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  week: DayState[];
}
