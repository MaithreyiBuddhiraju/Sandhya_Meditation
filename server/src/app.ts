import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb } from "./db/connection.js";
import { seedPairings } from "./db/seed/seedPairings.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { getSessionSecret } from "./services/authService.js";
import { aiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { journalRouter } from "./routes/journal.js";
import { pairingsRouter } from "./routes/pairings.js";
import { settingsRouter } from "./routes/settings.js";
import { streakRouter } from "./routes/streak.js";
import { thoughtsRouter } from "./routes/thoughts.js";

await initDb();
await seedPairings();

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser(getSessionSecret()));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Unprotected — the login flow itself, and the "do I need to log in?" check.
app.use("/api/auth", authRouter);

// Everything else under /api requires a valid session when APP_PASSWORD_HASH
// is set; a no-op pass-through otherwise (matches today's no-login default).
app.use("/api", requireAuth);

app.use("/api/pairings", pairingsRouter);
app.use("/api/journal", journalRouter);
app.use("/api/streak", streakRouter);
app.use("/api/thoughts", thoughtsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/ai", aiRouter);

// Local/LAN production mode only (`npm start`) — on Vercel, static assets are
// served by Vercel's own static layer and this function only ever receives
// /api/* traffic (see vercel.json's rewrite), so this is inert there.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Catches errors forwarded by asyncHandler (and anything else calling next(err)).
// Must be registered after all routes.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error." });
});
