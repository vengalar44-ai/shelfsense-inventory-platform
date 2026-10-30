import { Router } from 'express';
import { BusinessController } from './business.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/settings', BusinessController.getSettings);
router.put('/settings', authorize('OWNER_ADMIN'), BusinessController.updateSettings);

export default router;
