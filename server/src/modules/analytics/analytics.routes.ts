import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/dashboard', AnalyticsController.getDashboardMetrics);
router.get('/reports', AnalyticsController.getReports);

export default router;
