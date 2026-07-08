import "dotenv/config";
import cors from "cors";
import express from "express";
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

app.listen(port, () => {
  console.log(`Sandhya server listening on http://localhost:${port}`);
});
