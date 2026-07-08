# Sandhya

A local, dual-tradition daily reader and journal pairing Stoic philosophy with
teachings from the Bhagavad Gita and Srimad Devi Bhagavatam — plus a Thought
Sorter tool built on the Stoic dichotomy of control. "Sandhya" means the
twilight junctures of the day.

## Tech stack

- **Client**: React + Vite, TypeScript
- **Server**: Node + Express, TypeScript
- **Database**: SQLite via `better-sqlite3`
- **AI (optional)**: Anthropic API (`@anthropic-ai/sdk`, model `claude-sonnet-5`) —
  all AI features degrade gracefully without an API key

## Project structure

```
Sandhya/
  client/   React + Vite frontend
  server/   Express API + SQLite
```

## Setup

```bash
npm install          # installs concurrently at the root
cd server && npm install
cd ../client && npm install
```

Copy `server/.env.example` to `server/.env` and add your Anthropic API key if
you want the AI features enabled (optional — the app works fully without it).

## Run

```bash
npm run dev   # starts client (Vite) + server (Express) concurrently
```

Client: http://localhost:5173 (proxies `/api` to the server)
Server: http://localhost:3001

## Use it from your phone (same Wi-Fi)

`localhost` on your phone means the phone itself, not your Mac — so the dev
URLs above only work on the machine running them. To reach Sandhya from a
phone on the same Wi-Fi network:

1. Find your Mac's LAN IP:
   ```bash
   ipconfig getifaddr en0   # or en1, depending on your network interface
   ```
2. Build and run in production mode — one process serves both the API and
   the built client on a single port:
   ```bash
   npm start
   ```
3. On your phone's browser, go to `http://<that-IP>:3001` (e.g.
   `http://192.168.1.82:3001`).

Your Mac must stay awake and `npm start` must keep running for the phone to
reach it — this is LAN access, not public hosting. If macOS prompts to allow
incoming network connections for Node, allow it.

Note: `npm start` serves the last build. If you change the client code, rerun
`npm start` (or `npm run build`) to pick up the changes — there's no hot
reload in this mode. For active development with hot reload, use
`npm run dev` instead; it also binds to your LAN IP (Vite prints the network
URL to use).

## v1 Scope

- Daily Stoic + Gita/Devi Bhagavatam pairing with journal reflection
- Journal browse/search
- Streak counter with one grace day per week
- Thought Sorter (dichotomy-of-control worry triage) with a static baseline
  reframe per bucket, optionally AI-assisted
- Settings: tradition preference, Markdown export, API key status
- AI features (bridge explanation, verse discovery, sort-assist, weekly
  digest) — all optional, cached, and gracefully degrade without a key
