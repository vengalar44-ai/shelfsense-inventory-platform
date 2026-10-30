import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', NotificationController.getAll);
router.post('/mark-read', NotificationController.markAllAsRead);

export default router;
