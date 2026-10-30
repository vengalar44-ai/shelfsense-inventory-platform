import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../utils/response.js';

export class NotificationController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const notifications = await Notification.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(50);
      const unreadCount = await Notification.countDocuments({ businessId, isRead: false });

      return sendSuccess(res, { notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      await Notification.updateMany({ businessId, isRead: false }, { $set: { isRead: true } });
      return sendSuccess(res, null, 'All marked as read');
    } catch (error) {
      next(error);
    }
  }
}
