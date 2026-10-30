import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from './user.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { AuditService } from '../audit-logs/audit.service.js';

export class UserController {
  static async getTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const users = await User.find({ businessId }).select('-password').sort({ createdAt: -1 });
      return sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  static async createMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { fullName, email, password, role, phone } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        throw new AppError('User with this email already exists', 409);
      }

      const user = await User.create({
        businessId,
        fullName,
        email,
        password,
        role: role || 'CASHIER',
        phone,
      });

      await AuditService.log({
        user: req.user!,
        action: 'TEAM_MEMBER_CREATED',
        entityType: 'USER',
        entityId: user._id,
        details: { email, role },
      });

      return sendSuccess(
        res,
        {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive,
        },
        'Member created',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async toggleActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);

      if (id === req.user!.userId) {
        throw new AppError('Cannot deactivate your own account', 400);
      }

      const user = await User.findOne({ _id: new Types.ObjectId(id), businessId });
      if (!user) throw new AppError('User not found', 404);

      user.isActive = !user.isActive;
      await user.save();

      await AuditService.log({
        user: req.user!,
        action: 'USER_STATUS_TOGGLED',
        entityType: 'USER',
        entityId: user._id,
        details: { isActive: user.isActive },
      });

      return sendSuccess(res, { _id: user._id, isActive: user.isActive }, 'Status updated');
    } catch (error) {
      next(error);
    }
  }
}
