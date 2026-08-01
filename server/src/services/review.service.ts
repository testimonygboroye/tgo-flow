import { Review } from '../models/Review';
import { AppError } from '../utils/AppError';
import { sendReviewNotificationEmail } from './email.service';
import { env } from '../config/env';

export async function submitReview(reviewerName: string, reviewerEmail: string, reviewerRole: string, message: string) {
  const review = await Review.create({ reviewerName, reviewerEmail, reviewerRole, message });
  await sendReviewNotificationEmail(env.ownerEmail, reviewerName, reviewerEmail, reviewerRole, message);
  return review;
}

export async function listReviews() {
  return Review.find().sort({ createdAt: -1 });
}

export async function markReviewRead(reviewId: string, isRead: boolean) {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }
  review.isRead = isRead;
  await review.save();
  return review;
}

export async function deleteReview(reviewId: string) {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }
  await Review.deleteOne({ _id: reviewId });
}
