import express from 'express';
import { needSetup, createFirstAdmin } from '../controllers/setup.controller.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.get( '/', needSetup );
router.post( '/', authLimiter, createFirstAdmin);

export default router;
