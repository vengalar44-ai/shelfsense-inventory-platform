import mongoose, { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from './connection.js';
import { Business } from '../modules/businesses/business.model.js';
import { User } from '../modules/users/user.model.js';
import { Category } from '../modules/categories/category.model.js';
import { Product } from '../modules/products/product.model.js';
import { ProductBatch } from '../modules/batches/batch.model.js';
import { Supplier } from '../modules/suppliers/supplier.model.js';
import { PurchaseOrder } from '../modules/purchases/purchase.model.js';
import { Sale } from '../modules/sales/sale.model.js';
import { InventoryMovement } from '../modules/inventory/movement.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { AuditLog } from '../modules/audit-logs/auditLog.model.js';

export const seedDatabase = async () => {
  console.log('🌱 Starting ShelfSense comprehensive database seeding...');

  // Clear existing collections
  await Promise.all([
    Business.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductBatch.deleteMany({}),
    Supplier.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    Sale.deleteMany({}),
    InventoryMovement.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Create Demo Business
  const business = await Business.create({
    name: 'FreshChoice Supermarket & Mart',
    businessType: 'SUPERMARKET',
    email: 'contact@freshchoice.market',
    phone: '+1 (555) 234-5678',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      postalCode: '62704',
    },
    currency: 'USD',
    defaultTaxRate: 5,
    lowStockThresholdDefault: 12,
    nearExpiryThresholdDays: 30,
    isActive: true,
  });

  console.log(`✓ Business created: ${business.name} (${business._id})`);

  // 2. Create Users
  const owner = await User.create({
    businessId: business._id,
    fullName: 'Alexandra Vance (Business Owner)',
    email: 'admin@shelfsense.dev',
    password: 'Password@123',
    role: 'OWNER_ADMIN',
    phone: '+1 (555) 010-0001',
    isActive: true,
  });

  const manager = await User.create({
    businessId: business._id,
    fullName: 'Marcus Sterling (Inventory Manager)',
    email: 'manager@shelfsense.dev',
    password: 'Password@123',
    role: 'INVENTORY_MANAGER',
    phone: '+1 (555) 010-0002',
    isActive: true,
  });

  const cashier = await User.create({
    businessId: business._id,
    fullName: 'Chloe Bennett (Lead Cashier)',
    email: 'cashier@shelfsense.dev',
    password: 'Password@123',
    role: 'CASHIER',
    phone: '+1 (555) 010-0003',
    isActive: true,
  });

  console.log('✓ 3 Role-based Users created (admin, manager, cashier)');

  // 3. Create Categories
  const categoryNames = [
    { name: 'Dairy & Eggs', description: 'Fresh dairy, milk, yogurt, cheeses, eggs' },
    { name: 'Bakery & Bread', description: 'Fresh loaves, pastries, buns, and wraps' },
    { name: 'Beverages & Juices', description: 'Cold-pressed juices, sodas, organic teas' },
    { name: 'Pantry & Dry Goods', description: 'Grains, pasta, cooking oils, flour' },
    { name: 'Pharmaceuticals & Health', description: 'OTC medications, vitamins, first aid' },
    { name: 'Snacks & Confectionery', description: 'Chips, artisanal chocolates, nuts' },
  ];

  const categories = await Category.insertMany(
    categoryNames.map((c) => ({ ...c, businessId: business._id }))
  );
  console.log(`✓ ${categories.length} Categories created`);

  // 4. Create Suppliers
  const suppliersData = [
    {
      name: 'Valley Green Dairy Farms',
      contactPerson: 'David Miller',
      email: 'orders@valleygreendairy.com',
      phone: '+1 (555) 432-1001',
      address: { city: 'Madison', state: 'WI', country: 'USA' },
      paymentTerms: 'Net 15',
    },
    {
      name: 'Apex Pharma Distributors',
      contactPerson: 'Dr. Rebecca Chen',
      email: 'supply@apexpharma.com',
      phone: '+1 (555) 432-1002',
      address: { city: 'Boston', state: 'MA', country: 'USA' },
      paymentTerms: 'Net 30',
    },
    {
      name: 'Artisan Hearth Bakeries',
      contactPerson: 'Pierre Dupont',
      email: 'logistics@artisanhearth.com',
      phone: '+1 (555) 432-1003',
      address: { city: 'Chicago', state: 'IL', country: 'USA' },
      paymentTerms: 'Immediate',
    },
    {
      name: 'Global Harvest Import Co.',
      contactPerson: 'Carlos Santana',
      email: 'sales@globalharvest.com',
      phone: '+1 (555) 432-1004',
      address: { city: 'Seattle', state: 'WA', country: 'USA' },
      paymentTerms: 'Net 45',
    },
  ];

  const suppliers = await Supplier.insertMany(
    suppliersData.map((s) => ({ ...s, businessId: business._id, isActive: true }))
  );
  console.log(`✓ ${suppliers.length} Suppliers created`);

  // 5. Create 22 Products with rich attributes
  const rawProducts = [
    // Dairy
    {
      name: 'Organic Whole Milk 1 Gallon',
      sku: 'DAI-MILK-001',
      barcode: '890100100001',
      categoryIndex: 0,
      unit: 'bottle',
      purchasePrice: 2.8,
      sellingPrice: 4.49,
      minStockThreshold: 15,
      supplierIndex: 0,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    },
    {
      name: 'Greek Yogurt Vanilla 32oz',
      sku: 'DAI-YOG-002',
      barcode: '890100100002',
      categoryIndex: 0,
      unit: 'tub',
      purchasePrice: 3.1,
      sellingPrice: 5.29,
      minStockThreshold: 10,
      supplierIndex: 0,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
    },
    {
      name: 'Grass-fed Salted Butter 1lb',
      sku: 'DAI-BUT-003',
      barcode: '890100100003',
      categoryIndex: 0,
      unit: 'block',
      purchasePrice: 2.9,
      sellingPrice: 4.99,
      minStockThreshold: 12,
      supplierIndex: 0,
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300',
    },
    {
      name: 'Aged Sharp Cheddar Block 8oz',
      sku: 'DAI-CHE-004',
      barcode: '890100100004',
      categoryIndex: 0,
      unit: 'pack',
      purchasePrice: 3.5,
      sellingPrice: 5.99,
      minStockThreshold: 10,
      supplierIndex: 0,
      imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300',
    },

    // Bakery
    {
      name: 'Artisanal Sourdough Loaf',
      sku: 'BAK-SOU-005',
      barcode: '890100100005',
      categoryIndex: 1,
      unit: 'loaf',
      purchasePrice: 2.2,
      sellingPrice: 4.95,
      minStockThreshold: 8,
      supplierIndex: 2,
      imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=300',
    },
    {
      name: 'Whole Grain Sandwich Bread',
      sku: 'BAK-GRA-006',
      barcode: '890100100006',
      categoryIndex: 1,
      unit: 'loaf',
      purchasePrice: 1.8,
      sellingPrice: 3.49,
      minStockThreshold: 14,
      supplierIndex: 2,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    },
    {
      name: 'Butter Brioche Buns (4 Pack)',
      sku: 'BAK-BRI-007',
      barcode: '890100100007',
      categoryIndex: 1,
      unit: 'pack',
      purchasePrice: 2.1,
      sellingPrice: 3.99,
      minStockThreshold: 6,
      supplierIndex: 2,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300',
    },

    // Beverages
    {
      name: 'Cold Pressed Orange Juice 1L',
      sku: 'BEV-ORA-008',
      barcode: '890100100008',
      categoryIndex: 2,
      unit: 'bottle',
      purchasePrice: 2.4,
      sellingPrice: 4.79,
      minStockThreshold: 10,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300',
    },
    {
      name: 'Sparkling Mineral Water 750ml',
      sku: 'BEV-WAT-009',
      barcode: '890100100009',
      categoryIndex: 2,
      unit: 'bottle',
      purchasePrice: 1.1,
      sellingPrice: 2.49,
      minStockThreshold: 20,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300',
    },
    {
      name: 'Organic Green Tea (20 bags)',
      sku: 'BEV-TEA-010',
      barcode: '890100100010',
      categoryIndex: 2,
      unit: 'box',
      purchasePrice: 2.5,
      sellingPrice: 4.89,
      minStockThreshold: 15,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300',
    },

    // Pharmaceuticals
    {
      name: 'Paracetamol 500mg Tablets (24s)',
      sku: 'PHA-PAR-011',
      barcode: '890100100011',
      categoryIndex: 4,
      unit: 'box',
      purchasePrice: 1.2,
      sellingPrice: 3.25,
      minStockThreshold: 20,
      supplierIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    },
    {
      name: 'Vitamin C 1000mg Effervescent (20s)',
      sku: 'PHA-VIT-012',
      barcode: '890100100012',
      categoryIndex: 4,
      unit: 'tube',
      purchasePrice: 3.2,
      sellingPrice: 6.99,
      minStockThreshold: 12,
      supplierIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300',
    },
    {
      name: 'Antihistamine Allergy Relief (30s)',
      sku: 'PHA-ALL-013',
      barcode: '890100100013',
      categoryIndex: 4,
      unit: 'pack',
      purchasePrice: 4.5,
      sellingPrice: 9.49,
      minStockThreshold: 8,
      supplierIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300',
    },
    {
      name: 'Digital Oral Thermometer',
      sku: 'PHA-THE-014',
      barcode: '890100100014',
      categoryIndex: 4,
      unit: 'unit',
      purchasePrice: 5.5,
      sellingPrice: 12.99,
      minStockThreshold: 5,
      supplierIndex: 1,
      imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300',
    },

    // Pantry & Dry Goods
    {
      name: 'Extra Virgin Olive Oil 500ml',
      sku: 'PAN-OIL-015',
      barcode: '890100100015',
      categoryIndex: 3,
      unit: 'bottle',
      purchasePrice: 6.2,
      sellingPrice: 10.99,
      minStockThreshold: 10,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
    },
    {
      name: 'Organic Basmati Rice 5kg',
      sku: 'PAN-RIC-016',
      barcode: '890100100016',
      categoryIndex: 3,
      unit: 'bag',
      purchasePrice: 8.5,
      sellingPrice: 14.5,
      minStockThreshold: 10,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
    },
    {
      name: 'Artisan Penne Rigate Pasta 500g',
      sku: 'PAN-PAS-017',
      barcode: '890100100017',
      categoryIndex: 3,
      unit: 'pack',
      purchasePrice: 1.1,
      sellingPrice: 2.29,
      minStockThreshold: 20,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=300',
    },
    {
      name: 'Raw Wildflower Honey 400g',
      sku: 'PAN-HON-018',
      barcode: '890100100018',
      categoryIndex: 3,
      unit: 'jar',
      purchasePrice: 4.8,
      sellingPrice: 8.99,
      minStockThreshold: 8,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300',
    },

    // Snacks
    {
      name: 'Sea Salt & Vinegar Potato Crisps',
      sku: 'SNA-CHI-019',
      barcode: '890100100019',
      categoryIndex: 5,
      unit: 'bag',
      purchasePrice: 1.4,
      sellingPrice: 2.99,
      minStockThreshold: 15,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300',
    },
    {
      name: 'Dark Chocolate 72% Almond Bar 100g',
      sku: 'SNA-CHO-020',
      barcode: '890100100020',
      categoryIndex: 5,
      unit: 'bar',
      purchasePrice: 1.8,
      sellingPrice: 3.75,
      minStockThreshold: 12,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300',
    },
    {
      name: 'Roasted Cashews & Cranberry Mix 200g',
      sku: 'SNA-NUT-021',
      barcode: '890100100021',
      categoryIndex: 5,
      unit: 'pouch',
      purchasePrice: 3.2,
      sellingPrice: 6.49,
      minStockThreshold: 10,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300',
    },
    {
      name: 'Greek Kalamata Olives Jar 300g',
      sku: 'PAN-OLI-022',
      barcode: '890100100022',
      categoryIndex: 3,
      unit: 'jar',
      purchasePrice: 2.7,
      sellingPrice: 5.19,
      minStockThreshold: 8,
      supplierIndex: 3,
      imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=300',
    },
  ];

  const createdProducts = [];
  for (const raw of rawProducts) {
    const prod = await Product.create({
      businessId: business._id,
      categoryId: categories[raw.categoryIndex]!._id,
      name: raw.name,
      sku: raw.sku,
      barcode: raw.barcode,
      unit: raw.unit,
      purchasePrice: raw.purchasePrice,
      sellingPrice: raw.sellingPrice,
      minStockThreshold: raw.minStockThreshold,
      totalStock: 0,
      defaultSupplierId: suppliers[raw.supplierIndex]!._id,
      imageUrl: raw.imageUrl,
      isActive: true,
    });
    createdProducts.push(prod);
  }
  console.log(`✓ ${createdProducts.length} Products created`);

  // 6. Create Multiple Batches per product with realistic varied expiry dates
  const now = new Date();
  const days = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const batchesToInsert = [];
  let batchCounter = 100;

  for (let i = 0; i < createdProducts.length; i++) {
    const prod = createdProducts[i]!;
    batchCounter++;

    // Product 0 (Milk): 1 expired batch, 1 batch expiring in 4 days (critical), 1 batch expiring in 14 days
    if (i === 0) {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `MILK-LOT-${batchCounter}-EXP`,
          initialQuantity: 15,
          availableQuantity: 10,
          manufacturingDate: days(-30),
          expiryDate: days(-3), // EXPIRED 3 days ago
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[0]!._id,
          isExcludedFromSales: true,
          notes: 'Expired batch - marked for vendor credit return',
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `MILK-LOT-${batchCounter}-04D`,
          initialQuantity: 25,
          availableQuantity: 14,
          manufacturingDate: days(-10),
          expiryDate: days(4), // Expiring in 4 days (critical < 7d)
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[0]!._id,
          isExcludedFromSales: false,
          notes: 'Sell first under FEFO promo discount',
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `MILK-LOT-${batchCounter}-14D`,
          initialQuantity: 40,
          availableQuantity: 36,
          manufacturingDate: days(-2),
          expiryDate: days(14), // Good for 2 weeks
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[0]!._id,
          isExcludedFromSales: false,
        }
      );
    }
    // Product 4 (Sourdough): Expiring in 2 days
    else if (i === 4) {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `BAK-LOT-${batchCounter}-02D`,
          initialQuantity: 20,
          availableQuantity: 5,
          manufacturingDate: days(-2),
          expiryDate: days(2), // Expiring in 2 days
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[2]!._id,
          isExcludedFromSales: false,
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `BAK-LOT-${batchCounter}-06D`,
          initialQuantity: 25,
          availableQuantity: 22,
          manufacturingDate: days(-1),
          expiryDate: days(6),
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[2]!._id,
          isExcludedFromSales: false,
        }
      );
    }
    // Product 10 (Paracetamol): Long shelf life, plus one lot nearing 25 days
    else if (i === 10) {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `PHA-LOT-${batchCounter}-25D`,
          initialQuantity: 50,
          availableQuantity: 18,
          manufacturingDate: days(-300),
          expiryDate: days(25), // Expiring in 25 days (< 30d)
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[1]!._id,
          isExcludedFromSales: false,
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `PHA-LOT-${batchCounter}-360D`,
          initialQuantity: 100,
          availableQuantity: 95,
          manufacturingDate: days(-30),
          expiryDate: days(365), // 1 year
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[1]!._id,
          isExcludedFromSales: false,
        }
      );
    }
    // Product 1 (Yogurt): Expiring in 18 days
    else if (i === 1) {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `YOG-LOT-${batchCounter}-18D`,
          initialQuantity: 30,
          availableQuantity: 12,
          manufacturingDate: days(-12),
          expiryDate: days(18), // Expiring in 18 days (< 30d)
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[0]!._id,
          isExcludedFromSales: false,
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `YOG-LOT-${batchCounter}-45D`,
          initialQuantity: 30,
          availableQuantity: 28,
          manufacturingDate: days(-2),
          expiryDate: days(45), // Expiring in 45 days (< 60d)
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[0]!._id,
          isExcludedFromSales: false,
        }
      );
    }
    // Product 7 (Orange Juice): Expiring in 5 days
    else if (i === 7) {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `BEV-LOT-${batchCounter}-05D`,
          initialQuantity: 20,
          availableQuantity: 7,
          manufacturingDate: days(-10),
          expiryDate: days(5), // Expiring in 5 days (< 7d)
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[3]!._id,
          isExcludedFromSales: false,
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `BEV-LOT-${batchCounter}-60D`,
          initialQuantity: 35,
          availableQuantity: 30,
          manufacturingDate: days(-1),
          expiryDate: days(60),
          purchaseCost: prod.purchasePrice,
          supplierId: suppliers[3]!._id,
          isExcludedFromSales: false,
        }
      );
    }
    // Product 13 (Thermometer): Low stock product
    else if (i === 13) {
      batchesToInsert.push({
        businessId: business._id,
        productId: prod._id,
        batchNumber: `THE-LOT-${batchCounter}-LTD`,
        initialQuantity: 10,
        availableQuantity: 3, // BELOW minStockThreshold of 5 -> LOW STOCK
        manufacturingDate: days(-60),
        expiryDate: days(500),
        purchaseCost: prod.purchasePrice,
        supplierId: suppliers[1]!._id,
        isExcludedFromSales: false,
      });
    }
    // Standard distribution for all other products
    else {
      batchesToInsert.push(
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `LOT-${batchCounter}-A`,
          initialQuantity: 35,
          availableQuantity: 28,
          manufacturingDate: days(-20),
          expiryDate: days(50 + (i % 4) * 40),
          purchaseCost: prod.purchasePrice,
          supplierId: prod.defaultSupplierId,
          isExcludedFromSales: false,
        },
        {
          businessId: business._id,
          productId: prod._id,
          batchNumber: `LOT-${batchCounter}-B`,
          initialQuantity: 40,
          availableQuantity: 40,
          manufacturingDate: days(-5),
          expiryDate: days(180 + (i % 3) * 60),
          purchaseCost: prod.purchasePrice,
          supplierId: prod.defaultSupplierId,
          isExcludedFromSales: false,
        }
      );
    }
  }

  const createdBatches = await ProductBatch.insertMany(batchesToInsert);
  console.log(`✓ ${createdBatches.length} Product Batches created with varying expiry dates`);

  // Sync each product's aggregate total stock
  for (const prod of createdProducts) {
    const batches = await ProductBatch.find({
      businessId: business._id,
      productId: prod._id,
      isExcludedFromSales: false,
    });
    const total = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    prod.totalStock = total;
    await prod.save();
  }
  console.log('✓ Product total stocks synchronized');

  // 7. Create Purchase Orders
  const samplePO = await PurchaseOrder.create({
    businessId: business._id,
    orderNumber: `PO-${new Date().getFullYear()}-0001`,
    supplierId: suppliers[0]!._id,
    items: [
      {
        productId: createdProducts[0]!._id,
        quantityOrdered: 50,
        quantityReceived: 50,
        unitCost: 2.8,
        totalCost: 140,
        batchNumber: 'MILK-LOT-101-14D',
      },
      {
        productId: createdProducts[1]!._id,
        quantityOrdered: 30,
        quantityReceived: 30,
        unitCost: 3.1,
        totalCost: 93,
        batchNumber: 'YOG-LOT-102-45D',
      },
    ],
    status: 'RECEIVED',
    subTotal: 233,
    taxAmount: 11.65,
    totalAmount: 244.65,
    orderDate: days(-7),
    receivedDate: days(-2),
    createdBy: manager._id,
  });

  await PurchaseOrder.create({
    businessId: business._id,
    orderNumber: `PO-${new Date().getFullYear()}-0002`,
    supplierId: suppliers[1]!._id,
    items: [
      {
        productId: createdProducts[10]!._id,
        quantityOrdered: 100,
        quantityReceived: 0,
        unitCost: 1.2,
        totalCost: 120,
      },
      {
        productId: createdProducts[11]!._id,
        quantityOrdered: 40,
        quantityReceived: 0,
        unitCost: 3.2,
        totalCost: 128,
      },
    ],
    status: 'PENDING',
    subTotal: 248,
    taxAmount: 12.4,
    totalAmount: 260.4,
    orderDate: days(-1),
    createdBy: manager._id,
  });
  console.log('✓ Purchase Orders seeded');

  // 8. Create Sales Transactions across past days
  const sampleSale1 = await Sale.create({
    businessId: business._id,
    invoiceNumber: `INV-${new Date().getFullYear()}10-00001`,
    items: [
      {
        productId: createdProducts[0]!._id,
        productName: createdProducts[0]!.name,
        sku: createdProducts[0]!.sku,
        quantity: 2,
        unitPrice: createdProducts[0]!.sellingPrice,
        discount: 0,
        totalPrice: createdProducts[0]!.sellingPrice * 2,
        batchesAllocated: [
          {
            batchId: createdBatches[1]!._id,
            batchNumber: createdBatches[1]!.batchNumber,
            quantity: 2,
            unitCost: createdBatches[1]!.purchaseCost,
            expiryDate: createdBatches[1]!.expiryDate,
          },
        ],
      },
      {
        productId: createdProducts[4]!._id,
        productName: createdProducts[4]!.name,
        sku: createdProducts[4]!.sku,
        quantity: 1,
        unitPrice: createdProducts[4]!.sellingPrice,
        discount: 0.5,
        totalPrice: createdProducts[4]!.sellingPrice - 0.5,
        batchesAllocated: [
          {
            batchId: createdBatches[3]!._id,
            batchNumber: createdBatches[3]!.batchNumber,
            quantity: 1,
            unitCost: createdBatches[3]!.purchaseCost,
            expiryDate: createdBatches[3]!.expiryDate,
          },
        ],
      },
    ],
    subTotal: createdProducts[0]!.sellingPrice * 2 + createdProducts[4]!.sellingPrice,
    discountTotal: 0.5,
    taxRate: 5,
    taxAmount: 0.65,
    grandTotal: 13.92,
    paymentMethod: 'CARD',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 321-7788',
    cashierId: cashier._id,
    createdAt: days(-2),
  });

  const sampleSale2 = await Sale.create({
    businessId: business._id,
    invoiceNumber: `INV-${new Date().getFullYear()}10-00002`,
    items: [
      {
        productId: createdProducts[14]!._id,
        productName: createdProducts[14]!.name,
        sku: createdProducts[14]!.sku,
        quantity: 2,
        unitPrice: createdProducts[14]!.sellingPrice,
        discount: 0,
        totalPrice: createdProducts[14]!.sellingPrice * 2,
        batchesAllocated: [],
      },
      {
        productId: createdProducts[15]!._id,
        productName: createdProducts[15]!.name,
        sku: createdProducts[15]!.sku,
        quantity: 1,
        unitPrice: createdProducts[15]!.sellingPrice,
        discount: 0,
        totalPrice: createdProducts[15]!.sellingPrice,
        batchesAllocated: [],
      },
    ],
    subTotal: 36.48,
    discountTotal: 0,
    taxRate: 5,
    taxAmount: 1.82,
    grandTotal: 38.3,
    paymentMethod: 'CASH',
    customerName: 'Walk-in Customer',
    cashierId: cashier._id,
    createdAt: new Date(),
  });
  console.log('✓ Sales transactions seeded');

  // 9. Create Inventory Movements
  await InventoryMovement.create([
    {
      businessId: business._id,
      productId: createdProducts[0]!._id,
      batchId: createdBatches[1]!._id,
      movementType: 'SALE',
      quantity: -2,
      previousStock: 52,
      newStock: 50,
      reason: 'POS Invoice INV-202610-00001',
      performedBy: cashier._id,
      createdAt: days(-2),
    },
    {
      businessId: business._id,
      productId: createdProducts[0]!._id,
      batchId: createdBatches[0]!._id,
      movementType: 'DAMAGE',
      quantity: -5,
      previousStock: 57,
      newStock: 52,
      reason: 'Container cracked during unboxing - lot quarantined',
      performedBy: manager._id,
      createdAt: days(-5),
    },
    {
      businessId: business._id,
      productId: createdProducts[0]!._id,
      batchId: createdBatches[2]!._id,
      movementType: 'PURCHASE_RECEIPT',
      quantity: 40,
      previousStock: 17,
      newStock: 57,
      referenceType: 'PURCHASE_ORDER',
      referenceId: samplePO._id,
      reason: 'Supplier goods receipt PO-2026-0001',
      performedBy: manager._id,
      createdAt: days(-2),
    },
  ]);
  console.log('✓ Inventory Movements ledger seeded');

  // 10. Create System Notifications
  await Notification.create([
    {
      businessId: business._id,
      type: 'NEAR_EXPIRY',
      title: 'Products Expiring within 7 Days',
      message: 'Batch MILK-LOT-101-04D (Organic Whole Milk) expires in 4 days. 14 units remaining.',
      severity: 'WARNING',
      productId: createdProducts[0]!._id,
      createdAt: days(-1),
      isRead: false,
    },
    {
      businessId: business._id,
      type: 'EXPIRED',
      title: 'Expired Product Batch Quarantined',
      message: 'Batch MILK-LOT-101-EXP expired on ' + days(-3).toLocaleDateString() + '. Automatically excluded from POS sales.',
      severity: 'CRITICAL',
      productId: createdProducts[0]!._id,
      createdAt: days(-3),
      isRead: false,
    },
    {
      businessId: business._id,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert: Digital Oral Thermometer',
      message: 'Stock has reached 3 units, below the minimum threshold of 5 units.',
      severity: 'WARNING',
      productId: createdProducts[13]!._id,
      createdAt: days(-1),
      isRead: false,
    },
  ]);
  console.log('✓ System notifications seeded');

  // 11. Create Audit Logs
  await AuditLog.create([
    {
      businessId: business._id,
      userId: owner._id,
      userName: owner.fullName,
      userRole: owner.role,
      action: 'BUSINESS_REGISTERED',
      entityType: 'BUSINESS',
      entityId: business._id,
      details: { businessName: business.name },
    },
    {
      businessId: business._id,
      userId: manager._id,
      userName: manager.fullName,
      userRole: manager.role,
      action: 'PURCHASE_ORDER_RECEIVED',
      entityType: 'PURCHASE',
      entityId: samplePO._id,
      details: { orderNumber: samplePO.orderNumber, totalCost: 244.65 },
    },
    {
      businessId: business._id,
      userId: cashier._id,
      userName: cashier.fullName,
      userRole: cashier.role,
      action: 'SALE_COMPLETED',
      entityType: 'SALE',
      entityId: sampleSale1._id,
      details: { invoiceNumber: sampleSale1.invoiceNumber, grandTotal: 13.92 },
    },
  ]);
  console.log('✓ Audit logs seeded');

  console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('DEMO CREDENTIALS:');
  console.log('1. Admin / Owner:     admin@shelfsense.dev   / Password@123');
  console.log('2. Inventory Manager: manager@shelfsense.dev / Password@123');
  console.log('3. Staff / Cashier:   cashier@shelfsense.dev / Password@123');
  console.log('====================================================\n');
};

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDatabase();
      await seedDatabase();
      await disconnectDatabase();
      process.exit(0);
    } catch (e) {
      console.error('Seeding failed:', e);
      process.exit(1);
    }
  })();
}
