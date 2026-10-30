import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { PurchaseOrder } from './purchase.model.js';
import { ProductBatch } from '../batches/batch.model.js';
import { InventoryMovement } from '../inventory/movement.model.js';
import { Product } from '../products/product.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { AppError } from '../../utils/appError.js';
import { sendSuccess } from '../../utils/response.js';
import { FefoService } from '../batches/fefo.service.js';
import { AuditService } from '../audit-logs/audit.service.js';

export class PurchaseController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const orders = await PurchaseOrder.find({ businessId })
        .populate('supplierId', 'name email phone')
        .populate('items.productId', 'name sku unit')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 });

      return sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { supplierId, items, taxAmount = 0, notes, expectedDate } = req.body;

      if (!items || !items.length) {
        throw new AppError('At least one item is required in a purchase order', 400);
      }

      // Calculate totals
      let subTotal = 0;
      const formattedItems = items.map((item: any) => {
        const totalCost = Number(item.quantityOrdered) * Number(item.unitCost);
        subTotal += totalCost;
        return {
          productId: new Types.ObjectId(item.productId),
          quantityOrdered: Number(item.quantityOrdered),
          quantityReceived: 0,
          unitCost: Number(item.unitCost),
          totalCost,
          batchNumber: item.batchNumber || `BAT-${Date.now().toString().slice(-6)}`,
          manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : undefined,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        };
      });

      const totalAmount = subTotal + Number(taxAmount);
      const orderCount = await PurchaseOrder.countDocuments({ businessId });
      const orderNumber = `PO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

      const order = await PurchaseOrder.create({
        businessId,
        orderNumber,
        supplierId: new Types.ObjectId(supplierId),
        items: formattedItems,
        status: 'PENDING',
        subTotal,
        taxAmount,
        totalAmount,
        orderDate: new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        notes,
        createdBy: new Types.ObjectId(req.user!.userId),
      });

      await AuditService.log({
        user: req.user!,
        action: 'PURCHASE_ORDER_CREATED',
        entityType: 'PURCHASE',
        entityId: order._id,
        details: { orderNumber, totalAmount },
      });

      return sendSuccess(res, order, 'Purchase order created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async receiveOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const businessId = new Types.ObjectId(req.user!.businessId);
      const { receivedItems } = req.body; 
      // receivedItems: array of { productId, quantityReceived, batchNumber, manufacturingDate, expiryDate, purchaseCost }

      const order = await PurchaseOrder.findOne({ _id: new Types.ObjectId(id), businessId });
      if (!order) {
        throw new AppError('Purchase order not found', 404);
      }

      if (order.status === 'RECEIVED' || order.status === 'CANCELLED') {
        throw new AppError(`Cannot receive order with status: ${order.status}`, 400);
      }

      for (const item of order.items) {
        const receivedData = receivedItems?.find(
          (r: any) => r.productId === item.productId.toString()
        ) || {
          quantityReceived: item.quantityOrdered,
          batchNumber: item.batchNumber || `BAT-${Date.now().toString().slice(-6)}`,
          manufacturingDate: item.manufacturingDate,
          expiryDate: item.expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // fallback 180 days
        };

        const qty = Number(receivedData.quantityReceived || item.quantityOrdered);
        item.quantityReceived = qty;

        const product = await Product.findOne({ _id: item.productId, businessId });
        if (!product) continue;

        const prevStock = product.totalStock;

        // Create new ProductBatch
        const batch = await ProductBatch.create({
          businessId,
          productId: item.productId,
          batchNumber: receivedData.batchNumber,
          initialQuantity: qty,
          availableQuantity: qty,
          manufacturingDate: receivedData.manufacturingDate ? new Date(receivedData.manufacturingDate) : undefined,
          expiryDate: receivedData.expiryDate ? new Date(receivedData.expiryDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          purchaseCost: item.unitCost,
          supplierId: order.supplierId,
          purchaseOrderId: order._id,
        });

        // Update product stock
        const newStock = await FefoService.syncProductTotalStock(businessId, item.productId);

        // Record stock movement
        await InventoryMovement.create({
          businessId,
          productId: item.productId,
          batchId: batch._id,
          movementType: 'PURCHASE_RECEIPT',
          quantity: qty,
          previousStock: prevStock,
          newStock,
          unitCost: item.unitCost,
          referenceType: 'PURCHASE_ORDER',
          referenceId: order._id,
          reason: `Goods receipt for ${order.orderNumber}`,
          performedBy: new Types.ObjectId(req.user!.userId),
        });
      }

      order.status = 'RECEIVED';
      order.receivedDate = new Date();
      await order.save();

      await AuditService.log({
        user: req.user!,
        action: 'PURCHASE_ORDER_RECEIVED',
        entityType: 'PURCHASE',
        entityId: order._id,
        details: { orderNumber: order.orderNumber },
      });

      return sendSuccess(res, order, 'Purchase order received and inventory updated');
    } catch (error) {
      next(error);
    }
  }
}
