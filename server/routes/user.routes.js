import express from 'express';
import { getUsers, toggleUserActive, updateUser, toggleUserApproved } from '../controllers/user.controller.js';
import auth, { isAdmin, isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, isManagerOrAdmin, getUsers);
router.patch('/:id/toggle-active', auth, isManagerOrAdmin, toggleUserActive);
router.patch('/:id/toggle-approved', auth, isManagerOrAdmin, toggleUserApproved);
router.put('/:id', auth, isAdmin, updateUser)

export default router;