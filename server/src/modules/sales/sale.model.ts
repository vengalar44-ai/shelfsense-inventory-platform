import { Schema, model, Document, Types } from 'mongoose';

export interface ISaleBatchAllocation {
  batchId: Types.ObjectId;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate: Date;
}

export interface ISaleItem {
  productId: Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  batchesAllocated: ISaleBatchAllocation[];
}

export interface ISale extends Document {
  businessId: Types.ObjectId;
  invoiceNumber: string;
  items: ISaleItem[];
  subTotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'ONLINE' | 'OTHER';
  customerName?: string;
  customerPhone?: string;
  cashierId: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleBatchAllocationSchema = new Schema<ISaleBatchAllocation>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'ProductBatch', required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
  },
  { _id: false }
);

const saleItemSchema = new Schema<ISaleItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    batchesAllocated: [saleBatchAllocationSchema],
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    items: [saleItemSchema],
    subTotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'ONLINE', 'OTHER'],
      default: 'CASH',
    },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String, default: '' },
    cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

saleSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
saleSchema.index({ businessId: 1, createdAt: -1 });

export const Sale = model<ISale>('Sale', saleSchema);
