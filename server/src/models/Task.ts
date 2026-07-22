import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  _id: Types.ObjectId;
  list: Types.ObjectId;
  board: Types.ObjectId;
  title: string;
  description: string;
  position: number;
  assignees: Types.ObjectId[];
  labels: string[];
  dueDate: Date | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    list: { type: Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    position: { type: Number, required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    labels: [{ type: String, trim: true, maxlength: 50 }],
    dueDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
