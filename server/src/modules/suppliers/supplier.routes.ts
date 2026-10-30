import { Router } from 'express';
import { SupplierController } from './supplier.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', SupplierController.getAll);
router.post('/', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), SupplierController.create);
router.put('/:id', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), SupplierController.update);

export default router;
