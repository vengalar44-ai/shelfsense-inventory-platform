import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional().default(''),
    categoryId: z.string().optional(),
    description: z.string().optional().default(''),
    unit: z.string().default('pcs'),
    purchasePrice: z.number().min(0, 'Purchase price must be positive'),
    sellingPrice: z.number().min(0, 'Selling price must be positive'),
    minStockThreshold: z.number().min(0).default(10),
    defaultSupplierId: z.string().optional(),
    imageUrl: z.string().optional().default(''),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    barcode: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    unit: z.string().optional(),
    purchasePrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    minStockThreshold: z.number().min(0).optional(),
    defaultSupplierId: z.string().optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
