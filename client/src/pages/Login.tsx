import { useState } from "react";
import { authApi } from "../api/auth";
import "./Login.css";

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't log in — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <div className="login-card__title">Sandhya</div>
        <label htmlFor="password" className="login-card__label">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="login-card__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="login-card__error">{error}</p>}
        <button
          type="submit"
          className="button-primary login-card__submit"
          disabled={loading || !password}
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
