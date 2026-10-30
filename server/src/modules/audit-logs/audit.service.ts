import { Types } from 'mongoose';
import { AuditLog } from './auditLog.model.js';
import { IAuthUser } from '../../types/index.js';

interface LogAuditParams {
  user: IAuthUser;
  action: string;
  entityType: 'PRODUCT' | 'BATCH' | 'SALE' | 'PURCHASE' | 'USER' | 'BUSINESS' | 'INVENTORY';
  entityId?: Types.ObjectId | string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  static async log(params: LogAuditParams): Promise<void> {
    try {
      await AuditLog.create({
        businessId: new Types.ObjectId(params.user.businessId),
        userId: new Types.ObjectId(params.user.userId),
        userName: params.user.fullName,
        userRole: params.user.role,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ? new Types.ObjectId(params.entityId) : undefined,
        details: params.details || {},
        ipAddress: params.ipAddress,
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
      // Non-blocking error so primary transaction is not abruptly aborted
    }
  }
}
