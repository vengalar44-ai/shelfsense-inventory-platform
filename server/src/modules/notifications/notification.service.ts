import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import { NotificationType } from '../../types/index.js';

interface CreateNotificationParams {
  businessId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  productId?: string | Types.ObjectId;
  batchId?: string | Types.ObjectId;
}

export class NotificationService {
  static async create(params: CreateNotificationParams): Promise<void> {
    try {
      await Notification.create({
        businessId: new Types.ObjectId(params.businessId),
        type: params.type,
        title: params.title,
        message: params.message,
        severity: params.severity,
        productId: params.productId ? new Types.ObjectId(params.productId) : undefined,
        batchId: params.batchId ? new Types.ObjectId(params.batchId) : undefined,
        isRead: false,
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }

  static async checkStockAndExpiryAlerts(businessId: string | Types.ObjectId): Promise<void> {
    // Helper to proactively scan products & batches and create alerts if needed
    // Can be invoked after sales, stock updates, or via cron/schedule
  }
}
