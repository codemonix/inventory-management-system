import express from 'express';
import { fetchLogsHandler } from '../controllers/transaction.controller.js';
import auth, { isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/logs', auth, isManagerOrAdmin, fetchLogsHandler) ;

export default router;