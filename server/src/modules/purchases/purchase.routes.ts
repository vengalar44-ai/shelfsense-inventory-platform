import { Router } from 'express';
import { PurchaseController } from './purchase.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', PurchaseController.getAll);
router.post('/', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), PurchaseController.create);
router.post('/:id/receive', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), PurchaseController.receiveOrder);

export default router;
