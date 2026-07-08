import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE_NAME = "sandhya_auth";
export const AUTH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Auth only activates when a password hash is configured — unset, the app
 * behaves exactly as before (no login screen), matching today's local-dev default. */
export function isAuthEnabled(): boolean {
  return Boolean(process.env.APP_PASSWORD_HASH?.trim());
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.APP_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

let cachedEphemeralSecret: string | null = null;

/** Falls back to a random per-process secret if SESSION_SECRET is unset, so
 * auth still fails closed rather than not working at all — but sessions
 * won't survive a restart until SESSION_SECRET is set explicitly. Cached so
 * repeated calls within the same process return the same secret. */
export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (!cachedEphemeralSecret) {
    if (isAuthEnabled()) {
      console.warn(
        "APP_PASSWORD_HASH is set but SESSION_SECRET is not — using a temporary secret for this process. Set SESSION_SECRET so logins persist across restarts."
      );
    }
    cachedEphemeralSecret = crypto.randomBytes(32).toString("hex");
  }
  return cachedEphemeralSecret;
}
