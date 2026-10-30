import { Schema, model, Document, Types } from 'mongoose';
import { MovementType } from '../../types/index.js';

export interface IInventoryMovement extends Document {
  businessId: Types.ObjectId;
  productId: Types.ObjectId;
  batchId?: Types.ObjectId;
  movementType: MovementType;
  quantity: number; // positive for additions, negative for reductions
  previousStock: number;
  newStock: number;
  unitCost?: number;
  referenceType?: 'SALE' | 'PURCHASE_ORDER' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN';
  referenceId?: Types.ObjectId;
  reason?: string;
  performedBy: Types.ObjectId; // User
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'ProductBatch', index: true },
    movementType: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT', 'SALE', 'PURCHASE_RECEIPT', 'DAMAGE', 'RETURN', 'ADJUSTMENT'],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    referenceType: {
      type: String,
      enum: ['SALE', 'PURCHASE_ORDER', 'ADJUSTMENT', 'DAMAGE', 'RETURN'],
    },
    referenceId: { type: Schema.Types.ObjectId },
    reason: { type: String, default: '' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryMovementSchema.index({ businessId: 1, createdAt: -1 });

export const InventoryMovement = model<IInventoryMovement>('InventoryMovement', inventoryMovementSchema);
