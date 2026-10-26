
import { Router, RequestHandler } from 'express';
import { createLocation, getLocations, deleteLocation, updateLocation } from '../controllers/location.controller.js';
import  auth,{ isAdmin, isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Managing locations: manager or admin. Deleting: admin only.
router.get('/', auth, getLocations);
router.post('/', auth, isManagerOrAdmin, createLocation);
router.delete('/:id', auth, isAdmin, deleteLocation as unknown as RequestHandler);
router.put('/:id', auth, isManagerOrAdmin, updateLocation);


export default router;
