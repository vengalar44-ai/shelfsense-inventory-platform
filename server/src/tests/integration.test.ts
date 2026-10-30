import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { Express } from 'express';

describe('ShelfSense API & Business Logic Integration Tests', () => {
  let app: Express;
  let adminToken: string;
  let managerToken: string;
  let cashierToken: string;
  let businessId: string;
  let testProductId: string;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('Module 1: Authentication & RBAC', () => {
    it('should register a new business tenant and owner admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          businessName: 'Metro Health Pharmacy',
          businessType: 'PHARMACY',
          fullName: 'Dr. John Doe',
          email: 'johndoe@metrohealth.test',
          password: 'Password@123',
          phone: '+15550001111',
          currency: 'USD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('OWNER_ADMIN');
      adminToken = res.body.data.tokens.accessToken;
      businessId = res.body.data.business.id;
    });

    it('should prevent duplicate registration with the same email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          businessName: 'Metro Duplicate',
          businessType: 'PHARMACY',
          fullName: 'Duplicate Admin',
          email: 'johndoe@metrohealth.test',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate user and return tokens upon valid login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'johndoe@metrohealth.test',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('johndoe@metrohealth.test');
    });

    it('should reject login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'johndoe@metrohealth.test',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should create team members with specific roles (Inventory Manager and Cashier)', async () => {
      // Create Manager
      const mgrRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Sam Manager',
          email: 'manager@metrohealth.test',
          password: 'Password@123',
          role: 'INVENTORY_MANAGER',
        });

      expect(mgrRes.status).toBe(201);
      expect(mgrRes.body.data.role).toBe('INVENTORY_MANAGER');

      // Create Cashier
      const cashRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Alice Cashier',
          email: 'cashier@metrohealth.test',
          password: 'Password@123',
          role: 'CASHIER',
        });

      expect(cashRes.status).toBe(201);
      expect(cashRes.body.data.role).toBe('CASHIER');

      // Login as Cashier
      const cashLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'cashier@metrohealth.test', password: 'Password@123' });
      cashierToken = cashLogin.body.data.tokens.accessToken;
    });

    it('should enforce role-based access control (Cashier cannot create products)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Unauthorized Product',
          sku: 'UNAUTH-01',
          purchasePrice: 10,
          sellingPrice: 15,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Module 2: Products & Categories', () => {
    it('should create a category and a product under business tenant', async () => {
      const catRes = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Antibiotics',
          description: 'Prescription antibiotics',
        });

      expect(catRes.status).toBe(201);
      const categoryId = catRes.body.data._id;

      const prodRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Amoxicillin 500mg',
          sku: 'AMOX-500-CAP',
          barcode: '998877665544',
          categoryId,
          purchasePrice: 4.5,
          sellingPrice: 9.99,
          minStockThreshold: 10,
          unit: 'box',
        });

      expect(prodRes.status).toBe(201);
      expect(prodRes.body.data.name).toBe('Amoxicillin 500mg');
      testProductId = prodRes.body.data._id;
    });

    it('should query product by barcode', async () => {
      const res = await request(app)
        .get('/api/v1/products/barcode/998877665544')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sku).toBe('AMOX-500-CAP');
    });
  });

  describe('Module 3: Batches, Expiry & FEFO Engine', () => {
    it('should add multiple batches with different expiry dates and update totalStock', async () => {
      const now = new Date();
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Batch 1 (Expiring in 5 days)
      await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          batchNumber: 'LOT-AMOX-01-EARLY',
          initialQuantity: 10,
          expiryDate: in5Days.toISOString(),
          purchaseCost: 4.5,
        });

      // Batch 2 (Expiring in 90 days)
      await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          batchNumber: 'LOT-AMOX-02-LATE',
          initialQuantity: 20,
          expiryDate: in90Days.toISOString(),
          purchaseCost: 4.5,
        });

      // Verify aggregate total stock equals 10 + 20 = 30
      const prodRes = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(prodRes.body.data.totalStock).toBe(30);
    });

    it('should execute FEFO (First Expiry, First Out) deduction during checkout', async () => {
      // Checkout 12 units of Amoxicillin.
      // Expected: 10 units deducted from LOT-AMOX-01-EARLY, 2 units from LOT-AMOX-02-LATE.
      const checkoutRes = await request(app)
        .post('/api/v1/sales/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            {
              productId: testProductId,
              quantity: 12,
              unitPrice: 9.99,
              discount: 0,
            },
          ],
          taxRate: 5,
          paymentMethod: 'CASH',
          customerName: 'Patient Test',
        });

      expect(checkoutRes.status).toBe(201);
      const sale = checkoutRes.body.data;
      expect(sale.items[0].batchesAllocated.length).toBe(2);

      // Verify first batch LOT-AMOX-01-EARLY was allocated 10 units
      expect(sale.items[0].batchesAllocated[0].batchNumber).toBe('LOT-AMOX-01-EARLY');
      expect(sale.items[0].batchesAllocated[0].quantity).toBe(10);

      // Verify second batch LOT-AMOX-02-LATE was allocated 2 units
      expect(sale.items[0].batchesAllocated[1].batchNumber).toBe('LOT-AMOX-02-LATE');
      expect(sale.items[0].batchesAllocated[1].quantity).toBe(2);

      // Verify new product stock is 30 - 12 = 18
      const prodRes = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(prodRes.body.data.totalStock).toBe(18);
    });

    it('should reject checkout if requested quantity exceeds available non-expired stock', async () => {
      const checkoutRes = await request(app)
        .post('/api/v1/sales/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            {
              productId: testProductId,
              quantity: 50, // Only 18 available
              unitPrice: 9.99,
            },
          ],
        });

      expect(checkoutRes.status).toBe(400);
      expect(checkoutRes.body.success).toBe(false);
      expect(checkoutRes.body.message).toContain('Insufficient non-expired stock');
    });
  });

  describe('Module 4: Multi-Tenant Data Isolation', () => {
    it('should strictly isolate data between distinct businesses', async () => {
      // Register a second business
      const b2Res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          businessName: 'Downtown Supermart',
          businessType: 'SUPERMARKET',
          fullName: 'Jane Smith',
          email: 'janesmith@downtown.test',
          password: 'Password@123',
        });

      const b2Token = b2Res.body.data.tokens.accessToken;

      // Business 2 products list should be empty initially (cannot see Business 1 products)
      const b2ProdRes = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${b2Token}`);

      expect(b2ProdRes.status).toBe(200);
      expect(b2ProdRes.body.data.length).toBe(0);

      // Business 2 cannot query Business 1 product by ID
      const directQueryRes = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${b2Token}`);

      expect(directQueryRes.status).toBe(404);
    });
  });
});
