// Vercel serverless entry point. Vercel treats every file under /api as a
// function; this re-exports the same Express app used locally (server/src/app.ts)
// with no .listen() call — Vercel's runtime handles invocation per-request.
export { app as default } from "../server/src/app.js";
