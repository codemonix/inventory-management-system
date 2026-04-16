
import { Router, RequestHandler } from 'express';
import { handleImageUpload } from '../middleware/upload.middleware.js';
import auth, { isAdmin }  from '../middleware/auth.middleware.js';
import { createItem, 
    getItems, 
    getAllItems, 
    deleteItem, 
    updateItemImage, 
    updateItem, 
    getItemImage } from '../controllers/item.controller.js';
    
const router = Router();

router.post('/', auth, createItem);
router.get('/', auth, getItems);
router.get('/all', auth, getAllItems);
router.delete('/:id', auth, isAdmin, deleteItem as unknown as RequestHandler);
router.put('/:itemId', auth, isAdmin, updateItem);

router.post('/:itemId/update-image', auth, handleImageUpload, updateItemImage as unknown as RequestHandler);
router.get('/image/:filename', getItemImage)

export default router;