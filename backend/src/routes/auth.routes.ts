import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, forgotPasswordSchema, updateProfileSchema } from '../schemas/auth.schema';
import * as authCtrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', strictRateLimiter, validate(registerSchema), authCtrl.register);
router.post('/login', strictRateLimiter, validate(loginSchema), authCtrl.login);
router.post('/logout', authenticate, authCtrl.logout);
router.post('/refresh', authCtrl.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authCtrl.forgotPassword);
router.get('/me', authenticate, authCtrl.getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), authCtrl.updateProfile);

export default router;
