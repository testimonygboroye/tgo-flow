import { Request, Response, NextFunction } from 'express';
import { listAuthEvents } from '../services/authEvent.service';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const events = await listAuthEvents();
    res.status(200).json({ status: 'success', events });
  } catch (err) {
    next(err);
  }
}
