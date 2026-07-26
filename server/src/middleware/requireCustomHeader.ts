import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Blocks simple cross-site form submissions (a lightweight CSRF mitigation).
 * Plain HTML forms cannot set custom headers, but our own frontend can via
 * axios defaults. This only matters for cookie-only endpoints (logout,
 * refresh) — every other route already requires a Bearer token, which forms
 * can't set either, so this header check is specifically for those two.
 */
export function requireCustomHeader(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['x-tgo-client'];
  if (header !== 'tgo-flow-web') {
    next(new AppError('Request rejected: missing required client header', 403));
    return;
  }
  next();
}
