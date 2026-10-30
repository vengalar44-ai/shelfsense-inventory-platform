import { Router } from 'express';
import { SalesController } from './sales.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', SalesController.getAll);
router.get('/:id', SalesController.getById);
router.post('/checkout', SalesController.checkout);

export default router;
