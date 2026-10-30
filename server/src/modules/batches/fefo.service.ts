import { Types } from 'mongoose';
import { ProductBatch, IProductBatch } from './batch.model.js';
import { Product } from '../products/product.model.js';
import { AppError } from '../../utils/appError.js';
import { ISaleBatchAllocation } from '../sales/sale.model.js';

export interface BatchAllocationPlan {
  productId: string;
  productName: string;
  sku: string;
  requestedQuantity: number;
  totalAvailableNonExpired: number;
  allocations: {
    batchId: Types.ObjectId;
    batchNumber: string;
    quantity: number;
    unitCost: number;
    expiryDate: Date;
    remainingAfter: number;
  }[];
}

export class FefoService {
  /**
   * Calculates First Expiry, First Out (FEFO) allocation plan without committing changes
   */
  static async planAllocation(
    businessId: string | Types.ObjectId,
    productId: string | Types.ObjectId,
    quantityRequired: number
  ): Promise<BatchAllocationPlan> {
    const product = await Product.findOne({
      _id: new Types.ObjectId(productId),
      businessId: new Types.ObjectId(businessId),
      isActive: true,
    });

    if (!product) {
      throw new AppError(`Product with ID ${productId} not found or inactive.`, 404);
    }

    const now = new Date();

    // Query non-expired, available batches sorted strictly by earliest expiry
    const batches = await ProductBatch.find({
      businessId: new Types.ObjectId(businessId),
      productId: new Types.ObjectId(productId),
      isExcludedFromSales: false,
      availableQuantity: { $gt: 0 },
      expiryDate: { $gt: now },
    }).sort({ expiryDate: 1, createdAt: 1 });

    const totalAvailable = batches.reduce((acc, b) => acc + b.availableQuantity, 0);

    if (totalAvailable < quantityRequired) {
      throw new AppError(
        `Insufficient non-expired stock for product "${product.name}". Requested: ${quantityRequired}, Available: ${totalAvailable}`,
        400
      );
    }

    let remainingToAllocate = quantityRequired;
    const allocations: BatchAllocationPlan['allocations'] = [];

    for (const batch of batches) {
      if (remainingToAllocate <= 0) break;

      const take = Math.min(batch.availableQuantity, remainingToAllocate);
      allocations.push({
        batchId: batch._id as Types.ObjectId,
        batchNumber: batch.batchNumber,
        quantity: take,
        unitCost: batch.purchaseCost,
        expiryDate: batch.expiryDate,
        remainingAfter: batch.availableQuantity - take,
      });

      remainingToAllocate -= take;
    }

    return {
      productId: product._id.toString(),
      productName: product.name,
      sku: product.sku,
      requestedQuantity: quantityRequired,
      totalAvailableNonExpired: totalAvailable,
      allocations,
    };
  }

  /**
   * Applies the batch deduction in the database and updates product totalStock
   */
  static async executeAllocation(
    businessId: string | Types.ObjectId,
    allocations: BatchAllocationPlan['allocations'],
    productId: string | Types.ObjectId
  ): Promise<ISaleBatchAllocation[]> {
    const bId = new Types.ObjectId(businessId);
    const pId = new Types.ObjectId(productId);
    const appliedAllocations: ISaleBatchAllocation[] = [];

    for (const alloc of allocations) {
      const updatedBatch = await ProductBatch.findOneAndUpdate(
        {
          _id: alloc.batchId,
          businessId: bId,
          availableQuantity: { $gte: alloc.quantity },
        },
        {
          $inc: { availableQuantity: -alloc.quantity },
        },
        { new: true }
      );

      if (!updatedBatch) {
        throw new AppError(
          `Concurrency conflict: Batch ${alloc.batchNumber} had insufficient stock during checkout execution.`,
          409
        );
      }

      appliedAllocations.push({
        batchId: alloc.batchId,
        batchNumber: alloc.batchNumber,
        quantity: alloc.quantity,
        unitCost: alloc.unitCost,
        expiryDate: alloc.expiryDate,
      });
    }

    // Resync product totalStock
    await this.syncProductTotalStock(bId, pId);

    return appliedAllocations;
  }

  /**
   * Resyncs the aggregate active stock of a product from its batches
   */
  static async syncProductTotalStock(
    businessId: Types.ObjectId,
    productId: Types.ObjectId
  ): Promise<number> {
    const batches = await ProductBatch.find({
      businessId,
      productId,
      isExcludedFromSales: false,
    });

    const totalStock = batches.reduce((sum, b) => sum + Math.max(0, b.availableQuantity), 0);

    await Product.updateOne(
      { _id: productId, businessId },
      { $set: { totalStock } }
    );

    return totalStock;
  }
}
