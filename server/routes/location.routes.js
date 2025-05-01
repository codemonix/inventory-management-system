
import express from 'express';
import { createLocation, getLocations, deleteLocation } from '../controllers/location.controller.js';
import  auth,{ isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getLocations);
router.post('/', auth, isAdmin, createLocation);
router.delete('/:id', auth, isAdmin, deleteLocation);

export default router;