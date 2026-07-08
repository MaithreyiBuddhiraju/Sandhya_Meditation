import { useEffect, useState } from "react";
import { thoughtsApi } from "../api/thoughts";
import { todayString } from "../hooks/useToday";
import { ThoughtBucketCard } from "../components/ThoughtBucketCard";
import { Disclaimer } from "../components/Disclaimer";
import { BUCKET_INFO, BUCKET_ORDER } from "../constants/buckets";
import type { Bucket, SortedThought } from "../types";
import "./ThoughtSorter.css";

export function ThoughtSorter() {
  const [worryText, setWorryText] = useState("");
  const [sorting, setSorting] = useState<Bucket | null>(null);
  const [lastSorted, setLastSorted] = useState<SortedThought | null>(null);
  const [archive, setArchive] = useState<SortedThought[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(true);

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
  }, []);

  async function handleSort(bucket: Bucket) {
    if (!worryText.trim()) return;
    setSorting(bucket);
    try {
      const thought = await thoughtsApi.create(todayString(), worryText, bucket);
      setLastSorted(thought);
      setWorryText("");
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
          onChange={(e) => setWorryText(e.target.value)}
          placeholder="Type the worry or spiraling thought…"
          rows={4}
        />

        <p className="thought-sorter__prompt">Where does this actually belong?</p>
        <div className="thought-sorter__buckets">
          {BUCKET_ORDER.map((bucket) => (
            <button
              key={bucket}
              type="button"
              className="thought-sorter__bucket-button"
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
