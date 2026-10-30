import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Product } from '../products/product.model.js';
import { ProductBatch } from '../batches/batch.model.js';
import { Sale } from '../sales/sale.model.js';
import { InventoryMovement } from '../inventory/movement.model.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../utils/response.js';

export class AnalyticsController {
  static async getDashboardMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Aggregations in parallel
      const [
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        expiredBatchesCount,
        nearingExpiryBatchesCount,
        todaySalesAgg,
        monthlySalesAgg,
        inventoryValuationAgg,
        recentSales,
      ] = await Promise.all([
        Product.countDocuments({ businessId, isActive: true }),
        Product.countDocuments({
          businessId,
          isActive: true,
          $expr: {
            $and: [{ $lte: ['$totalStock', '$minStockThreshold'] }, { $gt: ['$totalStock', 0] }],
          },
        }),
        Product.countDocuments({ businessId, isActive: true, totalStock: { $lte: 0 } }),
        ProductBatch.countDocuments({ businessId, availableQuantity: { $gt: 0 }, expiryDate: { $lt: now } }),
        ProductBatch.countDocuments({
          businessId,
          availableQuantity: { $gt: 0 },
          expiryDate: { $gte: now, $lte: in30Days },
        }),
        Sale.aggregate([
          { $match: { businessId, createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ]),
        Sale.aggregate([
          { $match: { businessId, createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ]),
        ProductBatch.aggregate([
          { $match: { businessId, availableQuantity: { $gt: 0 } } },
          {
            $group: {
              _id: null,
              totalValue: { $sum: { $multiply: ['$availableQuantity', '$purchaseCost'] } },
              totalUnits: { $sum: '$availableQuantity' },
            },
          },
        ]),
        Sale.find({ businessId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('cashierId', 'fullName'),
      ]);

      const todaySales = todaySalesAgg[0]?.total || 0;
      const todayOrders = todaySalesAgg[0]?.count || 0;
      const monthlyRevenue = monthlySalesAgg[0]?.total || 0;
      const inventoryValue = Number((inventoryValuationAgg[0]?.totalValue || 0).toFixed(2));
      const totalInventoryUnits = inventoryValuationAgg[0]?.totalUnits || 0;

      // 7-day Sales Trend chart data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const salesTrendAgg = await Sale.aggregate([
        { $match: { businessId, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$grandTotal' },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return sendSuccess(res, {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        expiredBatchesCount,
        nearingExpiryBatchesCount,
        todaySales,
        todayOrders,
        monthlyRevenue,
        inventoryValue,
        totalInventoryUnits,
        recentSales,
        salesTrend: salesTrendAgg,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = new Types.ObjectId(req.user!.businessId);

      // Best selling products
      const topSelling = await Sale.aggregate([
        { $match: { businessId } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            sku: { $first: '$items.sku' },
            totalUnitsSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalUnitsSold: -1 } },
        { $limit: 10 },
      ]);

      // Category breakdown
      const categoryDistribution = await Product.aggregate([
        { $match: { businessId, isActive: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$category.name',
            count: { $sum: 1 },
            totalStock: { $sum: '$totalStock' },
          },
        },
      ]);

      return sendSuccess(res, {
        topSelling,
        categoryDistribution: categoryDistribution.map((c) => ({
          name: c._id || 'Uncategorized',
          productsCount: c.count,
          totalStock: c.totalStock,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
