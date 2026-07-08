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
- Database: SQLite via `better-sqlite3` (`PRAGMA foreign_keys = ON`, `journal_mode = WAL`)
- AI: `@anthropic-ai/sdk`, model `claude-sonnet-5`, routed through the server only

## Key File Structure
```
client/src/
  api/          fetch wrappers per resource
  pages/        DailyPairing, Journal, ThoughtSorter, Explore, Settings
  components/   PairingCard, JournalList, StreakDiyaRow, ThoughtBucketCard, AiBridgePanel, Disclaimer
  theme/        tokens.css (dawn/dusk palette, serif scripture type)
server/src/
  db/           connection.ts, schema.sql, seed/
  routes/       pairings, journal, thoughts, streak, settings, ai
  services/     streakService, pairingService, exportService, aiCacheService, anthropicClient
  content/      bucketReframes.ts (static Thought Sorter baseline)
```

## Project-Specific Constraints
- **Copyright**: Stoic theme summaries are original 1-2 sentence paraphrases
  attributed by philosopher/concept, never quoted text. Gita/Devi Bhagavatam
  entries cite chapter/verse only and use original paraphrases (a
  `translation_source_note` records which public-domain translation informed
  the paraphrase, for audit) — never reproduce copyrighted translation text.
- **API key**: lives only in `server/.env` (gitignored). No route reads or
  writes it; Settings shows configured/not-configured status only.
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

## Commands
```bash
npm run dev              # dev mode: client (Vite, hot reload) + server, concurrently
npm start                 # production mode: build client, serve client+API from one port
cd server && npm test    # streakService unit tests
```
