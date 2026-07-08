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

export type Bucket = "full_control" | "partial_control" | "no_control";

export interface SortedThought {
  id: number;
  entry_date: string;
  created_at: string;
  worry_text: string;
  bucket: Bucket;
  stoic_reframe: string;
  stoic_concept_ref: string | null;
  gita_reframe: string;
  gita_concept_ref: string | null;
  source: "manual" | "ai_assisted";
  outcome_note: string | null;
  outcome_recorded_at: string | null;
  updated_at: string;
}

export interface Settings {
  tradition_preference: TraditionPreference;
  ai_configured: boolean;
}

export interface AiEnvelope<T> {
  configured: boolean;
  cached: boolean;
  data: T | null;
  empty?: boolean;
}

export interface BridgeResult {
  connection: string;
  practice: string;
}

export interface ExploreSuggestion {
  tradition: Tradition;
  verse_ref: string;
  verse_paraphrase: string;
  stoic_concept: string;
  stoic_theme: string;
  bridge_prompt: string;
}

export interface SortAssistResult {
  suggested_bucket: Bucket;
  stoic_reframe: string;
  stoic_concept_ref: string;
  gita_reframe: string;
  gita_concept_ref: string;
}

export interface WeeklyDigestResult {
  themes: string[];
  pattern: string;
  suggested_focus: string;
}

export interface BucketReframe {
  stoic_reframe: string;
  stoic_concept_ref: string;
  gita_reframe: string;
  gita_concept_ref: string;
}
