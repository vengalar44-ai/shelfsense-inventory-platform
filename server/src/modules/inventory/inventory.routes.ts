import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/movements', InventoryController.getMovements);
router.post('/adjust', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), InventoryController.adjustStock);

export default router;
