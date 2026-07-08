import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME, isAuthEnabled } from "../services/authService.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthEnabled()) {
    next();
    return;
  }
  if (req.signedCookies?.[AUTH_COOKIE_NAME] === "ok") {
    next();
    return;
  }
  res.status(401).json({ error: "Authentication required." });
}
