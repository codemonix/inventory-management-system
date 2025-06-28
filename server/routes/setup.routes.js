import express from 'express';
import { needSetup, createFirstAdmin } from '../controllers/setup.controller.js';

const router = express.Router();

router.get( '/', needSetup );
router.post( '/' , createFirstAdmin);

export default router;
