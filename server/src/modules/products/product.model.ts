import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  businessId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  unit: string; // e.g. 'pcs', 'kg', 'box', 'strip', 'bottle'
  purchasePrice: number;
  sellingPrice: number;
  minStockThreshold: number;
  totalStock: number; // Synced aggregate of active batch quantities
  defaultSupplierId?: Types.ObjectId;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    unit: { type: String, default: 'pcs' },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    minStockThreshold: { type: Number, default: 10, min: 0 },
    totalStock: { type: Number, default: 0, min: 0 },
    defaultSupplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, barcode: 1 });
productSchema.index({ businessId: 1, name: 'text', description: 'text' });

export const Product = model<IProduct>('Product', productSchema);
