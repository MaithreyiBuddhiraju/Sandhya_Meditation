import { createClient, type Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

/**
 * DATABASE_URL selects local file (default, e.g. for `npm run dev`) vs a
 * remote Turso database (`libsql://...`, with DATABASE_AUTH_TOKEN) — same
 * @libsql/client API either way, so the rest of the codebase never branches
 * on which one is active.
 */
const databaseUrl =
  process.env.DATABASE_URL ?? `file:${path.join(__dirname, "..", "..", "data", "sandhya.db")}`;
const authToken = process.env.DATABASE_AUTH_TOKEN;
const isLocalFile = databaseUrl.startsWith("file:");

if (isLocalFile) {
  const filePath = databaseUrl.slice("file:".length);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export const db: Client = createClient({ url: databaseUrl, authToken });

let ready: Promise<void> | null = null;

/** Idempotent: safe to call from multiple entry points (local dev, Vercel function). */
export function initDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await db.execute("PRAGMA foreign_keys = ON");
      // WAL is a local-file storage optimization; meaningless for a remote Turso connection.
      if (isLocalFile) {
        await db.execute("PRAGMA journal_mode = WAL");
      }
      const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
      await db.executeMultiple(schema);
    })();
  }
  return ready;
}
