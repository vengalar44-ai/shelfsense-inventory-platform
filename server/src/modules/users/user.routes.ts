import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize('OWNER_ADMIN'), UserController.getTeam);
router.post('/', authorize('OWNER_ADMIN'), UserController.createMember);
router.patch('/:id/toggle-active', authorize('OWNER_ADMIN'), UserController.toggleActive);

export default router;
