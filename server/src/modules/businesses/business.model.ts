import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  businessType: 'GROCERY' | 'PHARMACY' | 'SUPERMARKET' | 'CONVENIENCE' | 'RETAIL' | 'WAREHOUSE' | 'OTHER';
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  currency: string;
  defaultTaxRate: number; // e.g. 5 for 5%
  lowStockThresholdDefault: number;
  nearExpiryThresholdDays: number; // default 30 days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: ['GROCERY', 'PHARMACY', 'SUPERMARKET', 'CONVENIENCE', 'RETAIL', 'WAREHOUSE', 'OTHER'],
      default: 'SUPERMARKET',
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    currency: { type: String, default: 'USD' },
    defaultTaxRate: { type: Number, default: 0 },
    lowStockThresholdDefault: { type: Number, default: 10 },
    nearExpiryThresholdDays: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Business = model<IBusiness>('Business', businessSchema);
