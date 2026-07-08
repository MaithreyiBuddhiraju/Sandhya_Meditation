import { useState } from "react";
import type { SortedThought } from "../types";
import { BUCKET_INFO } from "../constants/buckets";
import { thoughtsApi } from "../api/thoughts";
import "./ThoughtBucketCard.css";

function formatDate(entryDate: string): string {
  const [year, month, day] = entryDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ThoughtBucketCard({
  thought,
  onOutcomeSaved,
}: {
  thought: SortedThought;
  onOutcomeSaved?: (updated: SortedThought) => void;
}) {
  const [outcomeDraft, setOutcomeDraft] = useState("");
  const [editingOutcome, setEditingOutcome] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSaveOutcome() {
    if (!outcomeDraft.trim()) return;
    setSaving(true);
    try {
      const updated = await thoughtsApi.recordOutcome(thought.id, outcomeDraft);
      onOutcomeSaved?.(updated);
      setEditingOutcome(false);
      setOutcomeDraft("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card thought-card">
      <div className="thought-card__meta">
        <span className="thought-card__date">{formatDate(thought.entry_date)}</span>
        <span className={`thought-card__bucket-badge thought-card__bucket-badge--${thought.bucket}`}>
          {BUCKET_INFO[thought.bucket].label}
        </span>
      </div>

      <p className="thought-card__worry">{thought.worry_text}</p>

      <div className="thought-card__reframe">
        <p className="thought-card__reframe-label">Stoic</p>
        <p className="thought-card__reframe-text">{thought.stoic_reframe}</p>
        {thought.stoic_concept_ref && (
          <p className="thought-card__ref text-muted">{thought.stoic_concept_ref}</p>
        )}
      </div>

      <div className="thought-card__reframe">
        <p className="thought-card__reframe-label">Gita</p>
        <p className="thought-card__reframe-text">{thought.gita_reframe}</p>
        {thought.gita_concept_ref && (
          <p className="thought-card__ref text-muted">{thought.gita_concept_ref}</p>
        )}
      </div>

      <div className="thought-card__outcome">
        {thought.outcome_note ? (
          <>
            <p className="thought-card__outcome-label">How it turned out</p>
            <p className="thought-card__outcome-text">{thought.outcome_note}</p>
          </>
        ) : editingOutcome ? (
          <div className="thought-card__outcome-form">
            <textarea
              className="thought-card__outcome-input"
              value={outcomeDraft}
              onChange={(e) => setOutcomeDraft(e.target.value)}
              placeholder="How did this actually turn out?"
              rows={3}
            />
            <button
              type="button"
              className="button-primary thought-card__outcome-save"
              onClick={handleSaveOutcome}
              disabled={saving || !outcomeDraft.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="thought-card__outcome-prompt"
            onClick={() => setEditingOutcome(true)}
          >
            How did this turn out?
          </button>
        )}
      </div>
    </div>
  );
}
