import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Product } from './product.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { AuditService } from '../audit-logs/audit.service.js';

export class ProductController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { search, category, status, page = '1', limit = '50', sort = 'name' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = { businessId };

      if (status === 'low_stock') {
        filter.$expr = { $lte: ['$totalStock', '$minStockThreshold'] };
      } else if (status === 'out_of_stock') {
        filter.totalStock = { $lte: 0 };
      }

      if (category && category !== 'all') {
        filter.categoryId = new Types.ObjectId(category as string);
      }

      if (search) {
        const regex = new RegExp(search as string, 'i');
        filter.$or = [{ name: regex }, { sku: regex }, { barcode: regex }];
      }

      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .populate('defaultSupplierId', 'name')
        .sort(sort === 'stock_desc' ? { totalStock: -1 } : sort === 'stock_asc' ? { totalStock: 1 } : { createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return sendSuccess(res, products, 'Products retrieved successfully', 200, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({
        _id: new Types.ObjectId(id),
        businessId: new Types.ObjectId(req.user!.businessId),
      }).populate('categoryId defaultSupplierId');

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async getByBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { barcode } = req.params;
      const product = await Product.findOne({
        barcode,
        businessId: new Types.ObjectId(req.user!.businessId),
      }).populate('categoryId');

      if (!product) {
        throw new AppError('Product with this barcode not found', 404);
      }

      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const body = req.body;

      // Check unique SKU within this business
      const existingSku = await Product.findOne({ businessId, sku: body.sku });
      if (existingSku) {
        throw new AppError(`A product with SKU "${body.sku}" already exists in your business.`, 409);
      }

      const product = await Product.create({
        ...body,
        businessId,
        categoryId: body.categoryId ? new Types.ObjectId(body.categoryId) : undefined,
        defaultSupplierId: body.defaultSupplierId ? new Types.ObjectId(body.defaultSupplierId) : undefined,
      });

      await AuditService.log({
        user: req.user!,
        action: 'PRODUCT_CREATED',
        entityType: 'PRODUCT',
        entityId: product._id,
        details: { name: product.name, sku: product.sku },
      });

      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);

      const product = await Product.findOneAndUpdate(
        { _id: new Types.ObjectId(id), businessId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      await AuditService.log({
        user: req.user!,
        action: 'PRODUCT_UPDATED',
        entityType: 'PRODUCT',
        entityId: product._id,
        details: req.body,
      });

      return sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);

      const product = await Product.findOneAndUpdate(
        { _id: new Types.ObjectId(id), businessId },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      await AuditService.log({
        user: req.user!,
        action: 'PRODUCT_ARCHIVED',
        entityType: 'PRODUCT',
        entityId: product._id,
      });

      return sendSuccess(res, null, 'Product archived successfully');
    } catch (error) {
      next(error);
    }
  }
}
