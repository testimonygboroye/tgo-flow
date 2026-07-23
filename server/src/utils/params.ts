import { Request } from 'express';

/**
 * Safely extracts a single string value from req.params.
 * Express 5's typings allow params to be string | string[] (due to
 * path-to-regexp supporting repeated segments). Our routes never use
 * repeated segments, so a param is always a single string in practice —
 * this guards that assumption explicitly rather than casting blindly.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}
