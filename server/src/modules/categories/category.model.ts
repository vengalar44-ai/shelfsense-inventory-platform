import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  businessId: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

categorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
