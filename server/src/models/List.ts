import { Schema, model, Document, Types } from 'mongoose';

export interface IList extends Document {
  _id: Types.ObjectId;
  board: Types.ObjectId;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IList>(
  {
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    position: { type: Number, required: true },
  },
  { timestamps: true }
);

export const List = model<IList>('List', listSchema);
