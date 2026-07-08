import { useEffect, useState } from "react";
import { aiApi } from "../api/ai";
import type { WeeklyDigestResult } from "../types";
import "./WeeklyDigestPanel.css";

export function WeeklyDigestPanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeeklyDigestResult | null>(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiApi
      .getStatus()
      .then(({ configured }) => setConfigured(configured))
      .catch(() => setConfigured(false));
  }, []);

  async function handleDigest() {
    setLoading(true);
    setError(null);
    setEmpty(false);
    try {
      const envelope = await aiApi.weeklyDigest();
      if (!envelope.configured) {
        setConfigured(false);
        return;
      }
      if (envelope.empty || !envelope.data) {
        setEmpty(true);
        return;
      }
      setResult(envelope.data);
    } catch {
      setError("Couldn't reach Claude — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) return null;

  return (
    <div className="card weekly-digest">
      {!result && (
        <>
          <button
            type="button"
            className="weekly-digest__button"
            onClick={handleDigest}
            disabled={loading}
          >
            {loading ? "Reading your week…" : "Weekly reflection digest"}
          </button>
          <p className="weekly-digest__note">One short AI request over your last 7 days.</p>
        </>
      )}
      {empty && <p className="text-muted">No journal entries in the last 7 days yet.</p>}
      {error && <p className="weekly-digest__error">{error}</p>}
      {result && (
        <div className="weekly-digest__result">
          <p className="weekly-digest__label">Recurring themes</p>
          <ul className="weekly-digest__themes">
            {result.themes.map((theme, i) => (
              <li key={i}>{theme}</li>
            ))}
          </ul>
          <p className="weekly-digest__label">A pattern worth noticing</p>
          <p className="weekly-digest__text">{result.pattern}</p>
          <p className="weekly-digest__label">Suggested focus for next week</p>
          <p className="weekly-digest__text">{result.suggested_focus}</p>
        </div>
      )}
    </div>
  );
}
