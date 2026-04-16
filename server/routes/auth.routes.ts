
import { Router, RequestHandler } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller.js';
import  auth  from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getCurrentUser as RequestHandler);

export default router;