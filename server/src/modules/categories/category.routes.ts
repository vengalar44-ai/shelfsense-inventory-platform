import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', CategoryController.getAll);
router.post('/', authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'), CategoryController.create);

export default router;
