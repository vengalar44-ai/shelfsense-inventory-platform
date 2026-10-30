import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Sale } from './sale.model.js';
import { Product } from '../products/product.model.js';
import { InventoryMovement } from '../inventory/movement.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { FefoService } from '../batches/fefo.service.js';
import { AuditService } from '../audit-logs/audit.service.js';
import { NotificationService } from '../notifications/notification.service.js';

export class SalesController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { page = '1', limit = '50', search } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = { businessId };
      if (search) {
        filter.invoiceNumber = new RegExp(search as string, 'i');
      }

      const total = await Sale.countDocuments(filter);
      const sales = await Sale.find(filter)
        .populate('cashierId', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return sendSuccess(res, sales, 'Sales transactions retrieved', 200, {
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
      const sale = await Sale.findOne({
        _id: new Types.ObjectId(id),
        businessId: new Types.ObjectId(req.user!.businessId),
      }).populate('cashierId', 'fullName');

      if (!sale) throw new AppError('Sale record not found', 404);
      return sendSuccess(res, sale);
    } catch (error) {
      next(error);
    }
  }

  static async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const {
        items, // array of { productId, quantity, unitPrice, discount }
        taxRate = 0,
        paymentMethod = 'CASH',
        customerName = 'Walk-in Customer',
        customerPhone = '',
        notes,
      } = req.body;

      if (!items || !items.length) {
        throw new AppError('Cannot checkout an empty cart', 400);
      }

      // Step 1: Pre-validate & Plan FEFO allocation for every item in the cart
      const allocationPlans = [];
      for (const item of items) {
        const plan = await FefoService.planAllocation(
          businessId,
          item.productId,
          Number(item.quantity)
        );
        allocationPlans.push({ item, plan });
      }

      // Step 2: Execute allocations & prepare sale line items
      let subTotal = 0;
      let discountTotal = 0;
      const saleItems = [];

      for (const { item, plan } of allocationPlans) {
        const allocatedBatches = await FefoService.executeAllocation(
          businessId,
          plan.allocations,
          item.productId
        );

        const unitPrice = Number(item.unitPrice);
        const quantity = Number(item.quantity);
        const itemDiscount = Number(item.discount || 0);
        const lineTotal = unitPrice * quantity - itemDiscount;

        subTotal += unitPrice * quantity;
        discountTotal += itemDiscount;

        saleItems.push({
          productId: new Types.ObjectId(item.productId),
          productName: plan.productName,
          sku: plan.sku,
          quantity,
          unitPrice,
          discount: itemDiscount,
          totalPrice: lineTotal,
          batchesAllocated: allocatedBatches,
        });

        // Record InventoryMovement for this sale
        const product = await Product.findById(item.productId);
        await InventoryMovement.create({
          businessId,
          productId: item.productId,
          movementType: 'SALE',
          quantity: -quantity,
          previousStock: (product?.totalStock || 0) + quantity,
          newStock: product?.totalStock || 0,
          reason: `Customer Sale - ${quantity} pcs`,
          performedBy: new Types.ObjectId(req.user!.userId),
        });

        // Check if stock is now below threshold
        if (product && product.totalStock <= product.minStockThreshold) {
          await NotificationService.create({
            businessId,
            type: product.totalStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            title: product.totalStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
            message: `Product "${product.name}" (${product.sku}) has reached ${product.totalStock} ${product.unit}. Minimum threshold is ${product.minStockThreshold}.`,
            severity: product.totalStock === 0 ? 'CRITICAL' : 'WARNING',
            productId: product._id,
          });
        }
      }

      // Calculate taxes and final grand total
      const taxableSubtotal = Math.max(0, subTotal - discountTotal);
      const taxAmount = Number(((taxableSubtotal * Number(taxRate)) / 100).toFixed(2));
      const grandTotal = Number((taxableSubtotal + taxAmount).toFixed(2));

      // Generate invoice number
      const saleCount = await Sale.countDocuments({ businessId });
      const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(saleCount + 1).padStart(5, '0')}`;

      const sale = await Sale.create({
        businessId,
        invoiceNumber,
        items: saleItems,
        subTotal,
        discountTotal,
        taxRate: Number(taxRate),
        taxAmount,
        grandTotal,
        paymentMethod,
        customerName,
        customerPhone,
        cashierId: new Types.ObjectId(req.user!.userId),
        notes,
      });

      await AuditService.log({
        user: req.user!,
        action: 'SALE_COMPLETED',
        entityType: 'SALE',
        entityId: sale._id,
        details: { invoiceNumber, grandTotal, itemsCount: saleItems.length },
      });

      return sendSuccess(res, sale, 'Checkout completed successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
