import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedPairings } from "./db/seed/seedPairings.js";
import { aiRouter } from "./routes/ai.js";
import { journalRouter } from "./routes/journal.js";
import { pairingsRouter } from "./routes/pairings.js";
import { settingsRouter } from "./routes/settings.js";
import { streakRouter } from "./routes/streak.js";
import { thoughtsRouter } from "./routes/thoughts.js";

seedPairings();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/pairings", pairingsRouter);
app.use("/api/journal", journalRouter);
app.use("/api/streak", streakRouter);
app.use("/api/thoughts", thoughtsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/ai", aiRouter);

// Production mode: serve the built client (npm run build) alongside the API,
// so a phone on the same network only needs one address and one port.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Bind to all network interfaces (not just localhost) so devices on the same
// Wi-Fi — e.g. a phone — can reach this server via the host machine's LAN IP.
app.listen(port, "0.0.0.0", () => {
  console.log(`Sandhya server listening on http://localhost:${port} (and on your LAN IP)`);
});
