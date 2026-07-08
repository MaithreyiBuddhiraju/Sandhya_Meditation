import "dotenv/config";
import cors from "cors";
import express from "express";
import { seedPairings } from "./db/seed/seedPairings.js";
import { journalRouter } from "./routes/journal.js";
import { pairingsRouter } from "./routes/pairings.js";

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

app.listen(port, () => {
  console.log(`Sandhya server listening on http://localhost:${port}`);
});
