import { useEffect, useState } from "react";
import { aiApi } from "../api/ai";
import type { BridgeResult } from "../types";
import "./AiBridgePanel.css";

type Status = "checking" | "unavailable" | "ready";

export function AiBridgePanel({ pairingId }: { pairingId: number }) {
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    aiApi
      .getStatus()
      .then(({ configured }) => {
        if (!cancelled) setStatus(configured ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset any previous result when the underlying pairing changes.
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [pairingId]);

  async function handleFindBridge() {
    setLoading(true);
    setError(null);
    try {
      const envelope = await aiApi.getBridge(pairingId);
      if (!envelope.configured || !envelope.data) {
        setStatus("unavailable");
        return;
      }
      setResult(envelope.data);
      setCached(envelope.cached);
    } catch {
      setError("Couldn't reach Claude — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (status !== "ready") return null;

  return (
    <div className="ai-bridge-panel">
      {!result && (
        <>
          <button
            type="button"
            className="ai-bridge-panel__button"
            onClick={handleFindBridge}
            disabled={loading}
          >
            {loading ? "Finding the bridge…" : "Find the bridge"}
          </button>
          <p className="ai-bridge-panel__note">One short AI request.</p>
        </>
      )}
      {error && <p className="ai-bridge-panel__error">{error}</p>}
      {result && (
        <div className="ai-bridge-panel__result">
          <p className="ai-bridge-panel__label">The connection</p>
          <p className="ai-bridge-panel__text">{result.connection}</p>
          <p className="ai-bridge-panel__label">For today</p>
          <p className="ai-bridge-panel__text">{result.practice}</p>
          {cached && <p className="ai-bridge-panel__cached">From cache — no new request made.</p>}
        </div>
      )}
    </div>
  );
}
