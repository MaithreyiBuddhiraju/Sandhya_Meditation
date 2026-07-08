import { useEffect, useState } from "react";
import { thoughtsApi } from "../api/thoughts";
import { aiApi } from "../api/ai";
import { todayString } from "../hooks/useToday";
import { ThoughtBucketCard } from "../components/ThoughtBucketCard";
import { Disclaimer } from "../components/Disclaimer";
import { BUCKET_INFO, BUCKET_ORDER } from "../constants/buckets";
import type { Bucket, SortAssistResult, SortedThought } from "../types";
import "./ThoughtSorter.css";

export function ThoughtSorter() {
  const [worryText, setWorryText] = useState("");
  const [sorting, setSorting] = useState<Bucket | null>(null);
  const [lastSorted, setLastSorted] = useState<SortedThought | null>(null);
  const [archive, setArchive] = useState<SortedThought[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(true);

  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SortAssistResult | null>(null);

  async function loadArchive() {
    setLoadingArchive(true);
    try {
      setArchive(await thoughtsApi.search());
    } finally {
      setLoadingArchive(false);
    }
  }

  useEffect(() => {
    loadArchive();
    aiApi
      .getStatus()
      .then(({ configured }) => setAiConfigured(configured))
      .catch(() => setAiConfigured(false));
  }, []);

  async function handleAskAi() {
    if (!worryText.trim()) return;
    setAiLoading(true);
    try {
      const envelope = await aiApi.sortAssist(worryText);
      if (!envelope.configured || !envelope.data) {
        setAiConfigured(false);
        return;
      }
      setAiSuggestion(envelope.data);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSort(bucket: Bucket) {
    if (!worryText.trim()) return;
    setSorting(bucket);
    try {
      const customReframe = aiSuggestion
        ? {
            stoic_reframe: aiSuggestion.stoic_reframe,
            stoic_concept_ref: aiSuggestion.stoic_concept_ref,
            gita_reframe: aiSuggestion.gita_reframe,
            gita_concept_ref: aiSuggestion.gita_concept_ref,
          }
        : undefined;
      const thought = await thoughtsApi.create(todayString(), worryText, bucket, customReframe);
      setLastSorted(thought);
      setWorryText("");
      setAiSuggestion(null);
      await loadArchive();
    } finally {
      setSorting(null);
    }
  }

  return (
    <div className="thought-sorter">
      <div className="card thought-sorter__input-card">
        <label htmlFor="worry" className="thought-sorter__label">
          What's on your mind?
        </label>
        <textarea
          id="worry"
          className="thought-sorter__textarea"
          value={worryText}
          onChange={(e) => {
            setWorryText(e.target.value);
            setAiSuggestion(null);
          }}
          placeholder="Type the worry or spiraling thought…"
          rows={4}
        />

        {aiConfigured && (
          <div className="thought-sorter__ai-assist">
            <button
              type="button"
              className="thought-sorter__ai-button"
              onClick={handleAskAi}
              disabled={!worryText.trim() || aiLoading}
            >
              {aiLoading ? "Asking Claude…" : "Ask Claude for a suggestion"}
            </button>
            <p className="thought-sorter__ai-note">One short AI request.</p>
          </div>
        )}

        {aiSuggestion && (
          <div className="thought-sorter__ai-suggestion">
            <p className="thought-sorter__ai-suggestion-label">
              Claude suggests: {BUCKET_INFO[aiSuggestion.suggested_bucket].label}
            </p>
            <p className="thought-sorter__ai-suggestion-text">{aiSuggestion.stoic_reframe}</p>
            <p className="thought-sorter__ai-suggestion-text">{aiSuggestion.gita_reframe}</p>
            <p className="text-muted">Confirm or adjust the bucket below before saving.</p>
          </div>
        )}

        <p className="thought-sorter__prompt">Where does this actually belong?</p>
        <div className="thought-sorter__buckets">
          {BUCKET_ORDER.map((bucket) => (
            <button
              key={bucket}
              type="button"
              className={
                aiSuggestion?.suggested_bucket === bucket
                  ? "thought-sorter__bucket-button thought-sorter__bucket-button--suggested"
                  : "thought-sorter__bucket-button"
              }
              onClick={() => handleSort(bucket)}
              disabled={!worryText.trim() || sorting !== null}
            >
              <span className="thought-sorter__bucket-label">{BUCKET_INFO[bucket].label}</span>
              <span className="thought-sorter__bucket-desc">{BUCKET_INFO[bucket].description}</span>
              {sorting === bucket && <span className="thought-sorter__bucket-loading">Sorting…</span>}
            </button>
          ))}
        </div>
      </div>

      {lastSorted && (
        <ThoughtBucketCard
          thought={lastSorted}
          onOutcomeSaved={(updated) => setLastSorted(updated)}
        />
      )}

      <h2 className="thought-sorter__archive-title">Sorted archive</h2>
      {loadingArchive && <div className="loading-state">Loading archive…</div>}
      {!loadingArchive && archive.length === 0 && (
        <p className="text-muted">Nothing sorted yet.</p>
      )}
      {!loadingArchive &&
        archive
          .filter((t) => t.id !== lastSorted?.id)
          .map((thought) => (
            <ThoughtBucketCard
              key={thought.id}
              thought={thought}
              onOutcomeSaved={(updated) =>
                setArchive((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }
            />
          ))}

      <Disclaimer />
    </div>
  );
}
