import { Schema, model, Document } from 'mongoose';

export interface IReview extends Document {
  reviewerName: string;
  reviewerEmail: string;
  reviewerRole: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewerName: { type: String, required: true, trim: true, maxlength: 100 },
    reviewerEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    reviewerRole: { type: String, trim: true, maxlength: 100, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Review = model<IReview>('Review', reviewSchema);
