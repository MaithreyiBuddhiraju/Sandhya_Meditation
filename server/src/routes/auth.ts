import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  isAuthEnabled,
  verifyPassword,
} from "../services/authService.js";

export const authRouter = Router();

function isSecureRequest(): boolean {
  // Vercel (and most PaaS hosts) set NODE_ENV=production; local dev over
  // plain HTTP needs secure:false or the browser silently drops the cookie.
  return process.env.NODE_ENV === "production";
}

authRouter.get("/status", (req, res) => {
  const authRequired = isAuthEnabled();
  const authenticated = !authRequired || req.signedCookies?.[AUTH_COOKIE_NAME] === "ok";
  res.json({ authRequired, authenticated });
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!isAuthEnabled()) {
      res.json({ ok: true });
      return;
    }
    const { password } = req.body as { password?: string };
    if (!password || !(await verifyPassword(password))) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }
    res.cookie(AUTH_COOKIE_NAME, "ok", {
      signed: true,
      httpOnly: true,
      secure: isSecureRequest(),
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });
    res.json({ ok: true });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ ok: true });
});
