import { Schema, model, Document, Types } from 'mongoose';

export interface IProductBatch extends Document {
  businessId: Types.ObjectId;
  productId: Types.ObjectId;
  batchNumber: string;
  initialQuantity: number;
  availableQuantity: number;
  manufacturingDate?: Date;
  expiryDate: Date;
  purchaseCost: number;
  supplierId?: Types.ObjectId;
  purchaseOrderId?: Types.ObjectId;
  isExcludedFromSales: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productBatchSchema = new Schema<IProductBatch>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    batchNumber: { type: String, required: true, trim: true },
    initialQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date, required: true, index: true },
    purchaseCost: { type: Number, required: true, min: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    isExcludedFromSales: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for FEFO queries
productBatchSchema.index({ businessId: 1, productId: 1, expiryDate: 1, availableQuantity: 1 });
productBatchSchema.index({ businessId: 1, batchNumber: 1, productId: 1 }, { unique: true });

export const ProductBatch = model<IProductBatch>('ProductBatch', productBatchSchema);
