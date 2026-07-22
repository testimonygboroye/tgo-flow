import { Schema, model, Document, Types } from 'mongoose';

export type MembershipRole = 'owner' | 'admin' | 'member';

export interface IMembership extends Document {
  _id: Types.ObjectId;
  workspace: Types.ObjectId;
  user: Types.ObjectId;
  role: MembershipRole;
  createdAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], required: true, default: 'member' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

membershipSchema.index({ workspace: 1, user: 1 }, { unique: true });

export const Membership = model<IMembership>('Membership', membershipSchema);
