
import express from 'express';
import { upload } from '../utils/upload.js';
import auth, { isAdmin }  from '../middleware/auth.middleware.js';
import { createItem, getItems, getAllItems, deleteItem, updateItemImage, updateItem, getItemImage } from '../controllers/item.controller.js';
import { fetchItemCode } from '../middleware/fetchItemCode.middleware.js';
import debugLog from '../utils/logger.js';

const router = express.Router();

router.post('/', auth, createItem);
router.get('/', auth, getItems);
router.get('/all', auth, getAllItems);
router.delete('/:id', auth, isAdmin, deleteItem);
router.put('/:itemId', auth, isAdmin, updateItem);


router.post('/upload', auth,  upload.single('image'), (req, res) => {
    try {
        const filename = req.file.filename;
        res.status(200).json({ success: true, filename });
    } catch (error) {
        debugLog(error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/:itemId/update-image', auth, fetchItemCode, upload.single('image'), updateItemImage);
router.get('/image/:filename', getItemImage)

export default router;