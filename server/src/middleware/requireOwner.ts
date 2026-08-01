import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { User } from '../models/User';

export async function requireOwner(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== env.ownerEmail) {
      next(new AppError('Access denied', 403));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
