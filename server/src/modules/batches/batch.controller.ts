import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ProductBatch } from './batch.model.js';
import { Product } from '../products/product.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { FefoService } from './fefo.service.js';
import { AuditService } from '../audit-logs/audit.service.js';

export class BatchController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { productId, status, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = { businessId };

      if (productId) {
        filter.productId = new Types.ObjectId(productId as string);
      }

      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      if (status === 'expired') {
        filter.expiryDate = { $lt: now };
      } else if (status === 'expiring_7d') {
        filter.expiryDate = { $gte: now, $lte: in7Days };
      } else if (status === 'expiring_30d') {
        filter.expiryDate = { $gte: now, $lte: in30Days };
      } else if (status === 'expiring_60d') {
        filter.expiryDate = { $gte: now, $lte: in60Days };
      }

      const total = await ProductBatch.countDocuments(filter);
      const batches = await ProductBatch.find(filter)
        .populate('productId', 'name sku barcode unit minStockThreshold')
        .populate('supplierId', 'name')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(limitNum);

      return sendSuccess(res, batches, 'Batches retrieved', 200, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpirySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const [expired, in7, in30, in60, totalBatches] = await Promise.all([
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 }, expiryDate: { $lt: now } }),
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 }, expiryDate: { $gte: now, $lte: in7Days } }),
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 }, expiryDate: { $gte: now, $lte: in30Days } }),
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 }, expiryDate: { $gte: now, $lte: in60Days } }),
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 } }),
      ]);

      // Calculate estimated cost loss for expired products
      const expiredBatches = await ProductBatch.find({
        businessId,
        availableQuantity: { $gt: 0 },
        expiryDate: { $lt: now },
      });
      const expiredLossValue = expiredBatches.reduce(
        (sum, b) => sum + b.availableQuantity * b.purchaseCost,
        0
      );

      return sendSuccess(res, {
        counts: {
          expired,
          expiringIn7Days: in7,
          expiringIn30Days: in30,
          expiringIn60Days: in60,
          totalActiveBatches: totalBatches,
        },
        expiredLossValue: Number(expiredLossValue.toFixed(2)),
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const {
        productId,
        batchNumber,
        initialQuantity,
        manufacturingDate,
        expiryDate,
        purchaseCost,
        supplierId,
        notes,
      } = req.body;

      const product = await Product.findOne({ _id: new Types.ObjectId(productId), businessId });
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const existingBatch = await ProductBatch.findOne({
        businessId,
        productId: product._id,
        batchNumber,
      });

      if (existingBatch) {
        throw new AppError(`Batch number "${batchNumber}" already exists for this product.`, 409);
      }

      const batch = await ProductBatch.create({
        businessId,
        productId: product._id,
        batchNumber,
        initialQuantity,
        availableQuantity: initialQuantity,
        manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
        expiryDate: new Date(expiryDate),
        purchaseCost,
        supplierId: supplierId ? new Types.ObjectId(supplierId) : undefined,
        notes,
      });

      // Update product total stock
      await FefoService.syncProductTotalStock(businessId, product._id as Types.ObjectId);

      await AuditService.log({
        user: req.user!,
        action: 'BATCH_CREATED',
        entityType: 'BATCH',
        entityId: batch._id,
        details: { batchNumber, quantity: initialQuantity, expiryDate },
      });

      return sendSuccess(res, batch, 'Batch created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async toggleExcludeFromSales(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);

      const batch = await ProductBatch.findOne({ _id: new Types.ObjectId(id), businessId });
      if (!batch) {
        throw new AppError('Batch not found', 404);
      }

      batch.isExcludedFromSales = !batch.isExcludedFromSales;
      await batch.save();

      // Recalculate product total stock
      await FefoService.syncProductTotalStock(businessId, batch.productId);

      await AuditService.log({
        user: req.user!,
        action: 'BATCH_SALES_EXCLUSION_TOGGLED',
        entityType: 'BATCH',
        entityId: batch._id,
        details: { isExcludedFromSales: batch.isExcludedFromSales },
      });

      return sendSuccess(res, batch, 'Batch status updated');
    } catch (error) {
      next(error);
    }
  }
}
