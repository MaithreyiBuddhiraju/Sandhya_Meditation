import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 does not catch rejected promises from async route handlers —
 * an unhandled rejection would hang the request instead of reaching the
 * error middleware. Wrap every async handler with this so thrown/rejected
 * errors reach `next()` and get a proper JSON error response.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
