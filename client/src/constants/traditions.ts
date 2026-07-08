import type { TraditionPreference } from "../types";

export const TRADITION_INFO: Record<TraditionPreference, { label: string }> = {
  both: { label: "Both traditions" },
  gita: { label: "Bhagavad Gita only" },
  devi_bhagavatam: { label: "Srimad Devi Bhagavatam only" },
};

export const TRADITION_ORDER: TraditionPreference[] = ["both", "gita", "devi_bhagavatam"];
