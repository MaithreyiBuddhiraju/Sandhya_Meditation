import { useEffect, useState } from "react";
import { settingsApi } from "../api/settings";
import { TRADITION_INFO, TRADITION_ORDER } from "../constants/traditions";
import type { Settings as SettingsType, TraditionPreference } from "../types";
import "./Settings.css";

export function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  async function handlePreferenceChange(preference: TraditionPreference) {
    if (!settings || preference === settings.tradition_preference) return;
    setSavingPreference(true);
    try {
      setSettings(await settingsApi.updateTraditionPreference(preference));
    } finally {
      setSavingPreference(false);
    }
  }

  if (loading) return <div className="loading-state">Loading settings…</div>;
  if (!settings) return <div className="error-state">Couldn't load settings.</div>;

  return (
    <div className="settings-page">
      <div className="card settings-section">
        <h2 className="settings-section__title">Tradition</h2>
        <p className="text-muted settings-section__desc">
          Which tradition to pair with your daily Stoic theme.
        </p>
        <div className="settings-section__options">
          {TRADITION_ORDER.map((preference) => (
            <button
              key={preference}
              type="button"
              className={
                preference === settings.tradition_preference
                  ? "settings-option settings-option--selected"
                  : "settings-option"
              }
              onClick={() => handlePreferenceChange(preference)}
              disabled={savingPreference}
            >
              {TRADITION_INFO[preference].label}
            </button>
          ))}
        </div>
      </div>

      <div className="card settings-section">
        <h2 className="settings-section__title">AI features</h2>
        <p className="text-muted settings-section__desc">
          The Anthropic API key lives only in <code>server/.env</code> — never
          in the browser. Add <code>ANTHROPIC_API_KEY=...</code> there and
          restart the server to enable AI features.
        </p>
        <div
          className={
            settings.ai_configured
              ? "settings-status settings-status--on"
              : "settings-status settings-status--off"
          }
        >
          {settings.ai_configured ? "Configured" : "Not configured"}
        </div>
      </div>

      <div className="card settings-section">
        <h2 className="settings-section__title">Export</h2>
        <p className="text-muted settings-section__desc">
          Download all journal entries and sorted thoughts as a Markdown file.
        </p>
        <a className="button-primary settings-export-link" href="/api/settings/export" download>
          Export to Markdown
        </a>
      </div>
    </div>
  );
}
