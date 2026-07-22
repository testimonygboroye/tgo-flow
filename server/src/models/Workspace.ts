import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Workspace = model<IWorkspace>('Workspace', workspaceSchema);
