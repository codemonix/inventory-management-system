import express from 'express';
import { fetchLogsHandler } from '../controllers/transaction.controller';

const router = express.Router();

router.get('/logs', fetchLogsHandler) ;

export default router;