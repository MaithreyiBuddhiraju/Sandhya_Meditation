import { useEffect, useState } from "react";
import { aiApi } from "../api/ai";
import { pairingsApi } from "../api/pairings";
import type { ExploreSuggestion } from "../types";
import "./Explore.css";

const traditionLabel: Record<ExploreSuggestion["tradition"], string> = {
  gita: "Bhagavad Gita",
  devi_bhagavatam: "Srimad Devi Bhagavatam",
};

export function Explore() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [conceptText, setConceptText] = useState("");
  const [suggestions, setSuggestions] = useState<ExploreSuggestion[]>([]);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiApi
      .getStatus()
      .then(({ configured }) => setConfigured(configured))
      .catch(() => setConfigured(false));
  }, []);

  async function handleSuggest() {
    if (!conceptText.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSavedIndexes(new Set());
    try {
      const envelope = await aiApi.explore(conceptText);
      if (!envelope.configured || !envelope.data) {
        setConfigured(false);
        return;
      }
      setSuggestions(envelope.data);
    } catch {
      setError("Couldn't reach Claude — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(suggestion: ExploreSuggestion, index: number) {
    await pairingsApi.create({
      tradition: suggestion.tradition,
      stoic_concept: suggestion.stoic_concept,
      stoic_theme: suggestion.stoic_theme,
      verse_ref: suggestion.verse_ref,
      verse_paraphrase: suggestion.verse_paraphrase,
      bridge_prompt: suggestion.bridge_prompt,
      origin: "ai_explore",
    });
    setSavedIndexes((prev) => new Set(prev).add(index));
  }

  if (configured === false) {
    return (
      <div className="explore-page">
        <p className="text-muted">
          Enable AI in Settings (add an Anthropic API key to <code>server/.env</code>) to use
          Explore.
        </p>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="card explore-page__input-card">
        <label htmlFor="concept" className="explore-page__label">
          Type a Stoic concept
        </label>
        <input
          id="concept"
          className="explore-page__input"
          value={conceptText}
          onChange={(e) => setConceptText(e.target.value)}
          placeholder="e.g. resilience, letting go of anger…"
        />
        <button
          type="button"
          className="button-primary"
          onClick={handleSuggest}
          disabled={loading || !conceptText.trim() || configured === null}
        >
          {loading ? "Searching…" : "Suggest verses"}
        </button>
        <p className="explore-page__note">One short AI request.</p>
      </div>

      {error && <div className="error-state">{error}</div>}

      {suggestions.map((suggestion, index) => (
        <div key={index} className="card explore-card">
          <p className="explore-card__eyebrow">{traditionLabel[suggestion.tradition]}</p>
          <p className="explore-card__verse-ref">{suggestion.verse_ref}</p>
          <p className="explore-card__verse">{suggestion.verse_paraphrase}</p>
          <div className="explore-card__stoic">
            <p className="explore-card__stoic-concept">{suggestion.stoic_concept}</p>
            <p className="explore-card__stoic-theme">{suggestion.stoic_theme}</p>
          </div>
          <p className="explore-card__bridge">{suggestion.bridge_prompt}</p>
          <button
            type="button"
            className="explore-card__save"
            onClick={() => handleSave(suggestion, index)}
            disabled={savedIndexes.has(index)}
          >
            {savedIndexes.has(index) ? "Saved to library" : "Save to library"}
          </button>
        </div>
      ))}
    </div>
  );
}
