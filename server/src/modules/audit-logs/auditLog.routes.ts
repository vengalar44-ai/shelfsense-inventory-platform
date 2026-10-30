import { Router } from 'express';
import { AuditLogController } from './auditLog.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize('OWNER_ADMIN'), AuditLogController.getAll);

export default router;
