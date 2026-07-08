import { getPairingById } from "./pairingService.js";
import { searchEntries } from "./journalService.js";
import { runStructuredPrompt } from "./anthropicClient.js";
import { getCached, hashInput, setCached } from "./aiCacheService.js";

export interface AiResult<T> {
  data: T;
  cached: boolean;
}

// --- Find the bridge ---

export interface BridgeResult {
  connection: string;
  practice: string;
}

const BRIDGE_SYSTEM = `You are a calm, precise guide connecting Stoic philosophy with the Bhagavad Gita and Srimad Devi Bhagavatam. Given a Stoic theme and a paired verse paraphrase, explain the deeper thematic connection between them in 3-4 sentences, then give one concrete, practical action the reader could take today. Do not quote scripture or any copyrighted translation directly — refer to concepts and citations only. Keep a warm, steady tone. Respond only via the required JSON structure.`;

const BRIDGE_SCHEMA = {
  type: "object",
  properties: {
    connection: { type: "string" },
    practice: { type: "string" },
  },
  required: ["connection", "practice"],
  additionalProperties: false,
};

export async function getBridgeExplanation(pairingId: number): Promise<AiResult<BridgeResult> | null> {
  const pairing = getPairingById(pairingId);
  if (!pairing) return null;

  const inputHash = hashInput(String(pairingId), pairing.updated_at);
  const cached = getCached<BridgeResult>("bridge", inputHash);
  if (cached) return { data: cached, cached: true };

  const userMessage = [
    `Stoic concept: ${pairing.stoic_concept}`,
    `Stoic theme: ${pairing.stoic_theme}`,
    `Tradition: ${pairing.tradition === "gita" ? "Bhagavad Gita" : "Srimad Devi Bhagavatam"}`,
    `Verse reference: ${pairing.verse_ref}`,
    `Verse paraphrase: ${pairing.verse_paraphrase}`,
  ].join("\n");

  const data = await runStructuredPrompt<BridgeResult>({
    system: BRIDGE_SYSTEM,
    userMessage,
    schema: BRIDGE_SCHEMA,
  });

  setCached("bridge", inputHash, data);
  return { data, cached: false };
}

// --- Explore: suggest verses for a Stoic concept ---

export interface ExploreSuggestion {
  tradition: "gita" | "devi_bhagavatam";
  verse_ref: string;
  verse_paraphrase: string;
  stoic_concept: string;
  stoic_theme: string;
  bridge_prompt: string;
}

const EXPLORE_SYSTEM = `You are a knowledgeable guide connecting Stoic philosophy with the Bhagavad Gita and Srimad Devi Bhagavatam. The user will name a Stoic concept. Suggest 2 to 3 relevant verses, one per suggestion. For each: give the tradition, a chapter/verse citation only (for Devi Bhagavatam, use chapter-level citations like "7.33" from the Devi Gita section — Skandha 7, chapters 31-40 — since precise shloka numbering is uncertain), an original one-to-two sentence paraphrase of the verse (never reproduce copyrighted translation text), a one-to-two sentence original paraphrase of the Stoic concept itself attributed by philosopher and not quoted, and a one-line journal prompt bridging the two. Respond only via the required JSON structure.`;

const EXPLORE_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tradition: { type: "string", enum: ["gita", "devi_bhagavatam"] },
          verse_ref: { type: "string" },
          verse_paraphrase: { type: "string" },
          stoic_concept: { type: "string" },
          stoic_theme: { type: "string" },
          bridge_prompt: { type: "string" },
        },
        required: [
          "tradition",
          "verse_ref",
          "verse_paraphrase",
          "stoic_concept",
          "stoic_theme",
          "bridge_prompt",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

export async function getExploreSuggestions(
  conceptText: string
): Promise<AiResult<ExploreSuggestion[]>> {
  const normalized = conceptText.trim().toLowerCase();
  const inputHash = hashInput(normalized);
  const cached = getCached<{ suggestions: ExploreSuggestion[] }>("explore", inputHash);
  if (cached) return { data: cached.suggestions, cached: true };

  const data = await runStructuredPrompt<{ suggestions: ExploreSuggestion[] }>({
    system: EXPLORE_SYSTEM,
    userMessage: `Stoic concept: ${conceptText.trim()}`,
    schema: EXPLORE_SCHEMA,
  });

  setCached("explore", inputHash, data);
  return { data: data.suggestions, cached: false };
}

// --- Thought Sorter AI-assist ---

export interface SortAssistResult {
  suggested_bucket: "full_control" | "partial_control" | "no_control";
  stoic_reframe: string;
  stoic_concept_ref: string;
  gita_reframe: string;
  gita_concept_ref: string;
}

const SORT_ASSIST_SYSTEM = `You are a warm, steady guide helping someone process a worry through the Stoic dichotomy of control and the Gita's teaching of nishkama karma (action without attachment to results). Given a worry: (a) propose which control bucket it belongs to — full_control, partial_control, or no_control; (b) write one Stoic reframe grounded in a named Stoic concept with a source reference (e.g. "Epictetus, Enchiridion 1"); (c) write one Gita or Devi Bhagavatam reframe grounded in a named concept with a chapter/verse reference. Keep a warm, steady, non-clinical tone — this is a reflective journaling tool, not therapy. Respond only via the required JSON structure.`;

const SORT_ASSIST_SCHEMA = {
  type: "object",
  properties: {
    suggested_bucket: {
      type: "string",
      enum: ["full_control", "partial_control", "no_control"],
    },
    stoic_reframe: { type: "string" },
    stoic_concept_ref: { type: "string" },
    gita_reframe: { type: "string" },
    gita_concept_ref: { type: "string" },
  },
  required: [
    "suggested_bucket",
    "stoic_reframe",
    "stoic_concept_ref",
    "gita_reframe",
    "gita_concept_ref",
  ],
  additionalProperties: false,
};

export async function getSortAssist(worryText: string): Promise<AiResult<SortAssistResult>> {
  const inputHash = hashInput(worryText.trim());
  const cached = getCached<SortAssistResult>("thought_sort", inputHash);
  if (cached) return { data: cached, cached: true };

  const data = await runStructuredPrompt<SortAssistResult>({
    system: SORT_ASSIST_SYSTEM,
    userMessage: `Worry: ${worryText.trim()}`,
    schema: SORT_ASSIST_SCHEMA,
  });

  setCached("thought_sort", inputHash, data);
  return { data, cached: false };
}

// --- Weekly reflection digest ---

export interface WeeklyDigestResult {
  themes: string[];
  pattern: string;
  suggested_focus: string;
}

const WEEKLY_DIGEST_SYSTEM = `You are a thoughtful reading companion reviewing someone's last 7 days of personal journal reflections, each paired with a Stoic and Gita/Devi Bhagavatam theme. Identify recurring themes, one pattern worth noticing, and suggest one focus theme for the coming week. Be specific but gentle — this is a private journal, not a performance review. Respond only via the required JSON structure.`;

const WEEKLY_DIGEST_SCHEMA = {
  type: "object",
  properties: {
    themes: { type: "array", items: { type: "string" } },
    pattern: { type: "string" },
    suggested_focus: { type: "string" },
  },
  required: ["themes", "pattern", "suggested_focus"],
  additionalProperties: false,
};

function last7DaysRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: format(from), to: format(to) };
}

export async function getWeeklyDigest(): Promise<AiResult<WeeklyDigestResult> | { empty: true }> {
  const { from, to } = last7DaysRange();
  const entries = searchEntries({ from, to });
  if (entries.length === 0) return { empty: true };

  const inputHash = hashInput(...entries.map((e) => `${e.entry_date}:${e.updated_at}`));
  const cached = getCached<WeeklyDigestResult>("weekly_digest", inputHash);
  if (cached) return { data: cached, cached: true };

  const userMessage = entries
    .map((e) => `${e.entry_date} (${e.stoic_concept ?? "no pairing"}): ${e.reflection_text}`)
    .join("\n\n");

  const data = await runStructuredPrompt<WeeklyDigestResult>({
    system: WEEKLY_DIGEST_SYSTEM,
    userMessage,
    schema: WEEKLY_DIGEST_SCHEMA,
  });

  setCached("weekly_digest", inputHash, data);
  return { data, cached: false };
}
