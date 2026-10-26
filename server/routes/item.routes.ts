
import { Router, RequestHandler } from 'express';
import { handleImageUpload } from '../middleware/upload.middleware.js';
import auth, { isAdmin, isManagerOrAdmin }  from '../middleware/auth.middleware.js';
import { createItem, 
    getItems, 
    getAllItems, 
    deleteItem, 
    updateItemImage, 
    updateItem, 
    getItemImage } from '../controllers/item.controller.js';
    
const router = Router();

// Catalog changes: manager or admin. Deleting: admin only.
router.post('/', auth, isManagerOrAdmin, createItem);
router.get('/', auth, getItems);
router.get('/all', auth, getAllItems);
router.delete('/:id', auth, isAdmin, deleteItem as unknown as RequestHandler);
router.put('/:itemId', auth, isManagerOrAdmin, updateItem);

router.post('/:itemId/update-image', auth, isManagerOrAdmin, handleImageUpload, updateItemImage as unknown as RequestHandler);
router.get('/image/:filename', auth, getItemImage)

export default router;
