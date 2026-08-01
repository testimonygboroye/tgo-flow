import { api } from '../lib/api';

export interface Review {
  _id: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerRole: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function submitReviewRequest(
  reviewerName: string,
  reviewerEmail: string,
  reviewerRole: string,
  message: string
): Promise<{ message: string }> {
  const { data } = await api.post('/reviews', { reviewerName, reviewerEmail, reviewerRole, message });
  return data;
}

export async function listReviewsRequest(): Promise<Review[]> {
  const { data } = await api.get('/reviews');
  return data.reviews;
}

export async function markReviewReadRequest(reviewId: string, isRead: boolean): Promise<Review> {
  const { data } = await api.patch(`/reviews/${reviewId}/read`, { isRead });
  return data.review;
}

export async function deleteReviewRequest(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}
