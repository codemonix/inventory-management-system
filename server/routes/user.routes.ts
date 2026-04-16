import express, { RequestHandler } from 'express';
import { getUsers, toggleUserActive, updateUser, toggleUserApproved } from '../controllers/user.controller.js';
import auth, { isAdmin, isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, isManagerOrAdmin, getUsers as unknown as RequestHandler);
router.patch('/:id/toggle-active', auth, isManagerOrAdmin, toggleUserActive as unknown as RequestHandler);
router.patch('/:id/toggle-approved', auth, isManagerOrAdmin, toggleUserApproved as unknown as RequestHandler);
router.put('/:id', auth, isAdmin, updateUser as unknown as RequestHandler)

export default router;