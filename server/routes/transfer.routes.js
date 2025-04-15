
import express from 'express';
import { createTransfer, getAllTransfers } from '../controllers/transfer.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', auth, createTransfer);
router.get('/', auth, getAllTransfers);

export default router;