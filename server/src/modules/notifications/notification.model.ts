import { Schema, model, Document, Types } from 'mongoose';
import { NotificationType } from '../../types/index.js';

export interface INotification extends Document {
  businessId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  productId?: Types.ObjectId;
  batchId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: {
      type: String,
      enum: ['LOW_STOCK', 'OUT_OF_STOCK', 'NEAR_EXPIRY', 'EXPIRED', 'PURCHASE_STATUS', 'SYSTEM_ALERT'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    batchId: { type: Schema.Types.ObjectId, ref: 'ProductBatch' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ businessId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
