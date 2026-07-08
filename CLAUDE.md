# CLAUDE.md
# File location: /Users/maithreyi/Workspace_AI/Claude/Sandhya/CLAUDE.md

## Purpose
Sandhya is a local, single-user dual-tradition daily reader and journal:
Stoic philosophy paired with Bhagavad Gita / Srimad Devi Bhagavatam teachings,
plus a Thought Sorter (dichotomy-of-control worry triage). Mobile-first,
targeting a Pixel 8 XL browser. Full plan history:
`~/.claude/plans/build-a-local-web-replicated-platypus.md`.

## Tech Stack
- Client: React + Vite, TypeScript
- Server: Node + Express, TypeScript, run directly via `tsx` (no build step)
  locally; also exported (no `.listen()`) as a Vercel serverless function
- Database: SQLite via `@libsql/client` — local file by default, or a remote
  Turso database (`DATABASE_URL`/`DATABASE_AUTH_TOKEN`) for serverless hosting.
  All service functions are async (`await db.execute()`/`db.batch()`).
- Auth: optional single shared password (`APP_PASSWORD_HASH` bcrypt hash +
  `SESSION_SECRET`-signed cookie via `cookie-parser`) — inert unless
  `APP_PASSWORD_HASH` is set
- AI: `@anthropic-ai/sdk`, model `claude-sonnet-5`, routed through the server only

## Key File Structure
```
api/
  index.ts      Vercel function entry — re-exports server/src/app.ts's Express app
client/src/
  api/          fetch wrappers per resource
  pages/        DailyPairing, Journal, ThoughtSorter, Explore, Settings, Login
  components/   PairingCard, JournalList, StreakDiyaRow, ThoughtBucketCard, AiBridgePanel, Disclaimer
  theme/        tokens.css (dawn/dusk palette, serif scripture type)
server/src/
  app.ts        Express app (routes, middleware) — no .listen(), shared by local + Vercel
  index.ts      local/LAN entry point — imports app.ts, calls .listen()
  db/           connection.ts (libSQL client + initDb()), schema.sql, seed/
  routes/       pairings, journal, thoughts, streak, settings, ai, auth
  middleware/   asyncHandler (Express 4 doesn't auto-catch async rejections), requireAuth
  services/     streakService, pairingService, exportService, aiCacheService, anthropicClient, authService
  content/      bucketReframes.ts (static Thought Sorter baseline)
```

## Project-Specific Constraints
- **Copyright**: Stoic theme summaries are original 1-2 sentence paraphrases
  attributed by philosopher/concept, never quoted text. Gita/Devi Bhagavatam
  entries cite chapter/verse only and use original paraphrases (a
  `translation_source_note` records which public-domain translation informed
  the paraphrase, for audit) — never reproduce copyrighted translation text.
- **API key**: lives only in `server/.env` locally or Vercel's env var
  dashboard in production (gitignored either way). No route reads or writes
  it; Settings shows configured/not-configured status only.
- **libSQL named-arg strictness**: unlike `better-sqlite3`, `@libsql/client`
  errors if a named-args object includes a key the SQL doesn't reference —
  never spread a full record into `args`; pick exactly the bound columns.
- **Dates**: all `entry_date` values are client-local `YYYY-MM-DD` strings
  sent explicitly by the frontend — never inferred from the server clock.
- **Pairing cycling**: `pairings` has no fixed 366-row structure or explicit
  day index. Today's pairing is `ORDER BY id` at offset `(dayOfYear - 1) %
  COUNT(*)`, filtered by `tradition` first when the setting isn't `both`. This
  lets the seed set grow from ~10-15 pairings to 60+ without any schema change.
- **Streak**: derived on every read from `journal_entries` + `sorted_thoughts`
  dates — no denormalized streak table. See `services/streakService.ts` for
  the ISO-week, one-grace-day-per-week algorithm.
- **AI degrades gracefully**: every `/api/ai/*` route returns
  `200 {configured:false, data:null}` when no key is set — this is a normal
  response the frontend renders, not an error.
- **Journal**: one reflection per calendar date (`entry_date` is unique,
  upserted) — not free-form multiple-entries-per-day journaling.

- **Phone/LAN access**: Express also serves the built client (`client/dist`)
  and binds to `0.0.0.0`, so `npm start` (build + serve on one port) lets a
  phone on the same Wi-Fi reach the app via the host machine's LAN IP — no
  public hosting. Dev mode's Vite server (`npm run dev`) also binds to the
  LAN via `server.host: true` in `client/vite.config.ts`. See README's "Use
  it from your phone" section.
- **Vercel hosting**: `vercel.json` builds only the client as a static site
  (`outputDirectory: client/dist`) and rewrites `/api/*` to the `api/index.ts`
  function — everything else is served statically, never invoking the
  function. Requires `DATABASE_URL`/`DATABASE_AUTH_TOKEN` (Turso) since
  serverless functions can't use a local SQLite file. See README's "Deploy to
  Vercel" section.

## Commands
```bash
npm run dev              # dev mode: client (Vite, hot reload) + server, concurrently
npm start                 # production mode: build client, serve client+API from one port
cd server && npm test    # streakService unit tests
```
