
import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/me', auth, getCurrentUser)

export default router;