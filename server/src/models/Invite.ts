import { Schema, model, Document, Types } from 'mongoose';
import { MembershipRole } from './Membership';

export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface IInvite extends Document {
  _id: Types.ObjectId;
  workspace: Types.ObjectId;
  email: string;
  role: MembershipRole;
  tokenHash: string;
  status: InviteStatus;
  invitedBy: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['admin', 'member'], required: true, default: 'member' },
    tokenHash: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Invite = model<IInvite>('Invite', inviteSchema);
