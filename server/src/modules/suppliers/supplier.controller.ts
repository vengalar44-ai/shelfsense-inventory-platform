import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Supplier } from './supplier.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';

export class SupplierController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const suppliers = await Supplier.find({ businessId, isActive: true }).sort({ name: 1 });
      return sendSuccess(res, suppliers);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const supplier = await Supplier.create({ ...req.body, businessId });
      return sendSuccess(res, supplier, 'Supplier created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);
      const supplier = await Supplier.findOneAndUpdate(
        { _id: new Types.ObjectId(id), businessId },
        { $set: req.body },
        { new: true }
      );
      if (!supplier) throw new AppError('Supplier not found', 404);
      return sendSuccess(res, supplier, 'Supplier updated');
    } catch (error) {
      next(error);
    }
  }
}
