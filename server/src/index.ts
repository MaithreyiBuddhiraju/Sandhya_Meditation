import { db } from "./db/connection.js";
import { seedPairings } from "./db/seed/seedPairings.js";

seedPairings();

const { count } = db.prepare("SELECT COUNT(*) AS count FROM pairings").get() as {
  count: number;
};
console.log(`Sandhya DB ready at server/data/sandhya.db — ${count} pairings loaded.`);
