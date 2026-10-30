import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  businessId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: string;
  action: string; // e.g. 'PRODUCT_CREATED', 'SALE_COMPLETED', 'STOCK_ADJUSTED'
  entityType: string; // 'PRODUCT', 'BATCH', 'SALE', 'PURCHASE', 'USER', 'BUSINESS'
  entityId?: Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ businessId: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
