import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import batchRoutes from './modules/batches/batch.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import supplierRoutes from './modules/suppliers/supplier.routes.js';
import purchaseRoutes from './modules/purchases/purchase.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import auditRoutes from './modules/audit-logs/auditLog.routes.js';
import userRoutes from './modules/users/user.routes.js';
import businessRoutes from './modules/businesses/business.routes.js';

import { errorHandler } from './middleware/error.middleware.js';
import { config } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Basic security and parsing middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ShelfSense API',
      version: '1.0.0',
    });
  });

  // API Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/batches', batchRoutes);
  app.use('/api/v1/inventory', inventoryRoutes);
  app.use('/api/v1/suppliers', supplierRoutes);
  app.use('/api/v1/purchases', purchaseRoutes);
  app.use('/api/v1/sales', salesRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/businesses', businessRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Resource not found on route: ${req.originalUrl}`,
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
