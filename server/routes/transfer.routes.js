
import express from 'express';
import { createTransfer, getAllTransfers, confirmTransfer } from '../controllers/transfer.controller.js';
import  auth  from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', auth, createTransfer);
router.put('/:id/complete', auth, confirmTransfer);
router.get('/', auth, getAllTransfers);

export default router;