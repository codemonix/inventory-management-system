import { Router, RequestHandler }from 'express';
import { fetchLogsHandler } from '../controllers/transaction.controller.js';
import auth, { isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/logs', auth, isManagerOrAdmin, fetchLogsHandler as unknown as RequestHandler) ;

export default router;