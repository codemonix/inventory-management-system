
import express from 'express';
import { createLocation, getLocations } from '../controllers/location.controller.js';
import { auth, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getLocations);
router.post('/', auth, isAdmin, createLocation);

export default router;