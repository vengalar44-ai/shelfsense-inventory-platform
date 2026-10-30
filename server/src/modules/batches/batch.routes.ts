import { Router } from 'express';
import { BatchController } from './batch.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', BatchController.getAll);
router.get('/expiry-summary', BatchController.getExpirySummary);
router.post('/', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), BatchController.create);
router.patch('/:id/toggle-exclude', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), BatchController.toggleExcludeFromSales);

export default router;
