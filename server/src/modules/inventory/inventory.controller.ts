import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { InventoryMovement } from './movement.model.js';
import { Product } from '../products/product.model.js';
import { ProductBatch } from '../batches/batch.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { FefoService } from '../batches/fefo.service.js';
import { AuditService } from '../audit-logs/audit.service.js';

export class InventoryController {
  static async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { productId, movementType, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = { businessId };
      if (productId) {
        filter.productId = new Types.ObjectId(productId as string);
      }
      if (movementType) {
        filter.movementType = movementType;
      }

      const total = await InventoryMovement.countDocuments(filter);
      const movements = await InventoryMovement.find(filter)
        .populate('productId', 'name sku unit')
        .populate('batchId', 'batchNumber expiryDate')
        .populate('performedBy', 'fullName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return sendSuccess(res, movements, 'Movements retrieved', 200, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { productId, batchId, quantityChange, reason, movementType = 'ADJUSTMENT' } = req.body;

      if (!productId || quantityChange === undefined) {
        throw new AppError('Product ID and quantity change are required', 400);
      }

      const product = await Product.findOne({ _id: new Types.ObjectId(productId), businessId });
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const prevStock = product.totalStock;

      if (batchId) {
        const batch = await ProductBatch.findOne({ _id: new Types.ObjectId(batchId), businessId });
        if (!batch) {
          throw new AppError('Batch not found', 404);
        }

        const newBatchQty = batch.availableQuantity + quantityChange;
        if (newBatchQty < 0) {
          throw new AppError(`Cannot reduce batch stock below 0. Available: ${batch.availableQuantity}`, 400);
        }

        batch.availableQuantity = newBatchQty;
        await batch.save();
      }

      // Sync overall totalStock
      const newStock = await FefoService.syncProductTotalStock(businessId, product._id as Types.ObjectId);

      // Record movement ledger
      const movement = await InventoryMovement.create({
        businessId,
        productId: product._id,
        batchId: batchId ? new Types.ObjectId(batchId) : undefined,
        movementType,
        quantity: quantityChange,
        previousStock: prevStock,
        newStock,
        reason: reason || 'Manual stock adjustment',
        performedBy: new Types.ObjectId(req.user!.userId),
      });

      await AuditService.log({
        user: req.user!,
        action: 'INVENTORY_ADJUSTED',
        entityType: 'INVENTORY',
        entityId: product._id,
        details: { quantityChange, prevStock, newStock, reason },
      });

      return sendSuccess(res, { product, movement }, 'Stock adjusted successfully');
    } catch (error) {
      next(error);
    }
  }
}
