import { Schema, model, Document, Types } from 'mongoose';

export type AuthEventType = 'register' | 'login' | 'logout' | 'app_return' | 'account_deleted';

export interface IAuthEvent extends Document {
  user: Types.ObjectId | null;
  userEmail: string;
  userName: string;
  eventType: AuthEventType;
  metadata: string;
  createdAt: Date;
}

const authEventSchema = new Schema<IAuthEvent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['register', 'login', 'logout', 'app_return', 'account_deleted'],
      required: true,
    },
    metadata: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuthEvent = model<IAuthEvent>('AuthEvent', authEventSchema);
