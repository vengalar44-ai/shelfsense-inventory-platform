import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Category } from './category.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../utils/response.js';

export class CategoryController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const categories = await Category.find({ businessId }).sort({ name: 1 });
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { name, description } = req.body;
      const category = await Category.create({ businessId, name, description });
      return sendSuccess(res, category, 'Category created', 201);
    } catch (error) {
      next(error);
    }
  }
}
