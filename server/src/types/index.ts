import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'OWNER_ADMIN' | 'INVENTORY_MANAGER' | 'CASHIER';

export interface IAuthUser {
  userId: string;
  businessId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, any>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type BatchStatus = 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'DEPLETED';

export type MovementType = 
  | 'STOCK_IN' 
  | 'STOCK_OUT' 
  | 'SALE' 
  | 'PURCHASE_RECEIPT' 
  | 'DAMAGE' 
  | 'RETURN' 
  | 'ADJUSTMENT';

export type PurchaseOrderStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'PARTIALLY_RECEIVED' 
  | 'RECEIVED' 
  | 'CANCELLED';

export type NotificationType = 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'NEAR_EXPIRY' 
  | 'EXPIRED' 
  | 'PURCHASE_STATUS' 
  | 'SYSTEM_ALERT';
