import { Request, Response, NextFunction } from 'express';
import { listActivity } from '../services/activity.service';
import { getParam } from '../utils/params';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await listActivity(getParam(req, 'id'));
    res.status(200).json({ status: 'success', activity });
  } catch (err) {
    next(err);
  }
}
