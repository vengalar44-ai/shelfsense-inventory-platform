import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './product.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', ProductController.getAll);
router.get('/barcode/:barcode', ProductController.getByBarcode);
router.get('/:id', ProductController.getById);

router.post(
  '/',
  authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'),
  validateRequest(createProductSchema),
  ProductController.create
);

router.put(
  '/:id',
  authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'),
  validateRequest(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  authorize('OWNER_ADMIN', 'INVENTORY_MANAGER'),
  ProductController.delete
);

export default router;
