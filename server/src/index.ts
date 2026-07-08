import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;

// Bind to all network interfaces (not just localhost) so devices on the same
// Wi-Fi — e.g. a phone — can reach this server via the host machine's LAN IP.
app.listen(port, "0.0.0.0", () => {
  console.log(`Sandhya server listening on http://localhost:${port} (and on your LAN IP)`);
});
