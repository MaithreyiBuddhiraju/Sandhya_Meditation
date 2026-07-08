import { useEffect, useState } from "react";
import { journalApi } from "../api/journal";
import { JournalList } from "../components/JournalList";
import type { JournalEntryWithPairing } from "../types";
import "./Journal.css";

export function Journal() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntryWithPairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Small debounce so we don't fire a search request on every keystroke.
    const timer = setTimeout(async () => {
      try {
        const results = await journalApi.search({ query: query.trim() || undefined });
        if (!cancelled) setEntries(results);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load journal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="journal-page">
      <input
        type="search"
        className="journal-page__search"
        placeholder="Search your reflections…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search journal entries"
      />

      {loading && <div className="loading-state">Loading entries…</div>}
      {error && <div className="error-state">{error}</div>}
      {!loading && !error && <JournalList entries={entries} />}
    </div>
  );
}
