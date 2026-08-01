import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { getParam } from '../utils/params';

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reviewerName, reviewerEmail, reviewerRole, message } = req.body;
    await reviewService.submitReview(reviewerName, reviewerEmail, reviewerRole || '', message);
    res.status(201).json({ status: 'success', message: 'Thank you for your feedback!' });
  } catch (err) {
    next(err);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reviews = await reviewService.listReviews();
    res.status(200).json({ status: 'success', reviews });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isRead } = req.body;
    const review = await reviewService.markReviewRead(getParam(req, 'id'), isRead);
    res.status(200).json({ status: 'success', review });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await reviewService.deleteReview(getParam(req, 'id'));
    res.status(200).json({ status: 'success', message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}
