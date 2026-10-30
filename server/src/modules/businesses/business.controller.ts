import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Business } from './business.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';

export class BusinessController {
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const business = await Business.findById(businessId);
      if (!business) throw new AppError('Business not found', 404);
      return sendSuccess(res, business);
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const business = await Business.findByIdAndUpdate(
        businessId,
        { $set: req.body },
        { new: true }
      );
      return sendSuccess(res, business, 'Business settings updated');
    } catch (error) {
      next(error);
    }
  }
}
