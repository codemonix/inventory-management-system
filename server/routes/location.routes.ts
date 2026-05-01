
import { Router, RequestHandler } from 'express';
import { createLocation, getLocations, deleteLocation, updateLocation } from '../controllers/location.controller.js';
import  auth,{ isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', auth, getLocations);
router.post('/', auth, isAdmin, createLocation);
router.delete('/:id', auth, isAdmin, deleteLocation as unknown as RequestHandler);
router.put('/:id', auth, isAdmin, updateLocation);


export default router;