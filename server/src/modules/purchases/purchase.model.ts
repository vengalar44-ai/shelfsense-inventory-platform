import { Schema, model, Document, Types } from 'mongoose';
import { PurchaseOrderStatus } from '../../types/index.js';

export interface IPurchaseOrderItem {
  productId: Types.ObjectId;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
}

export interface IPurchaseOrder extends Document {
  businessId: Types.ObjectId;
  orderNumber: string;
  supplierId: Types.ObjectId;
  items: IPurchaseOrderItem[];
  status: PurchaseOrderStatus;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantityOrdered: { type: Number, required: true, min: 1 },
    quantityReceived: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    batchNumber: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    orderNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [purchaseOrderItemSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    subTotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, default: Date.now },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ businessId: 1, orderNumber: 1 }, { unique: true });

export const PurchaseOrder = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
