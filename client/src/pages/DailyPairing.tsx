import { useEffect, useState } from "react";
import { pairingsApi } from "../api/pairings";
import { journalApi } from "../api/journal";
import { streakApi } from "../api/streak";
import { todayString } from "../hooks/useToday";
import { PairingCard } from "../components/PairingCard";
import { StreakDiyaRow } from "../components/StreakDiyaRow";
import { AiBridgePanel } from "../components/AiBridgePanel";
import type { Pairing, StreakSummary } from "../types";
import "./DailyPairing.css";

type SaveState = "idle" | "saving" | "saved" | "error";

export function DailyPairing() {
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [reflection, setReflection] = useState("");
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const today = todayString();

  async function loadStreak() {
    try {
      setStreak(await streakApi.getSummary(today));
    } catch {
      // Streak is a nice-to-have on this screen — a failure here shouldn't block the pairing.
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const todaysPairing = await pairingsApi.getToday(today);
        if (cancelled) return;
        setPairing(todaysPairing);

        try {
          const entry = await journalApi.getByDate(today);
          if (!cancelled) setReflection(entry.reflection_text);
        } catch {
          // No entry yet for today — leave the textarea blank.
        }

        await loadStreak();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load today's pairing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [today]);

  async function handleSave() {
    if (!pairing || !reflection.trim()) return;
    setSaveState("saving");
    try {
      await journalApi.save(today, reflection, pairing.id);
      setSaveState("saved");
      await loadStreak(); // journaling today may light up today's diya
    } catch {
      setSaveState("error");
    }
  }

  if (loading) return <div className="loading-state">Loading today's pairing…</div>;
  if (error || !pairing) return <div className="error-state">{error ?? "No pairing found."}</div>;

  return (
    <div className="daily-pairing">
      {streak && <StreakDiyaRow summary={streak} />}

      <PairingCard pairing={pairing}>
        <AiBridgePanel pairingId={pairing.id} />
      </PairingCard>

      <div className="card reflection-card">
        <label htmlFor="reflection" className="reflection-card__label">
          Your reflection
        </label>
        <textarea
          id="reflection"
          className="reflection-card__textarea"
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            setSaveState("idle");
          }}
          placeholder="Where did today's pairing show up for you?"
          rows={6}
        />
        <div className="reflection-card__actions">
          <button
            className="button-primary"
            onClick={handleSave}
            disabled={saveState === "saving" || !reflection.trim()}
          >
            {saveState === "saving" ? "Saving…" : "Save reflection"}
          </button>
          {saveState === "saved" && <span className="reflection-card__status">Saved</span>}
          {saveState === "error" && (
            <span className="reflection-card__status reflection-card__status--error">
              Couldn't save — try again.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
