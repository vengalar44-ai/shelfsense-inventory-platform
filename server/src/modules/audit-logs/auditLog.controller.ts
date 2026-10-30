import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuditLog } from './auditLog.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../utils/response.js';

export class AuditLogController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const logs = await AuditLog.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(100);
      return sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
}
