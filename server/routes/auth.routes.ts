
import { Router, RequestHandler } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller.js';
import  auth  from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', auth, getCurrentUser as unknown as RequestHandler);

export default router;
