import { Schema, model, Document, Types } from 'mongoose';

export type ActivityAction =
  | 'workspace_created'
  | 'member_invited'
  | 'member_joined'
  | 'member_role_changed'
  | 'member_removed'
  | 'board_created'
  | 'board_deleted'
  | 'task_created'
  | 'task_moved'
  | 'task_deleted'
  | 'task_commented';

export interface IActivity extends Document {
  workspace: Types.ObjectId;
  actor: Types.ObjectId;
  action: ActivityAction;
  description: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'workspace_created',
        'member_invited',
        'member_joined',
        'member_role_changed',
        'member_removed',
        'board_created',
        'board_deleted',
        'task_created',
        'task_moved',
        'task_deleted',
        'task_commented',
      ],
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = model<IActivity>('Activity', activitySchema);
