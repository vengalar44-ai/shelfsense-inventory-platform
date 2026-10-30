import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { registerBusinessSchema, loginSchema, refreshTokenSchema } from './auth.validator.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateRequest(registerBusinessSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
