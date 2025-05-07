
import express from 'express';
import { upload } from '../utils/upload.js';
import auth, { isAdmin }  from '../middleware/auth.middleware.js';
import { createItem, getItems, deleteItem, updateItemImage } from '../controllers/item.controller.js';
import { fetchItemCode } from '../middleware/fetchItemCode.middleware.js';

const router = express.Router();

router.post('/', auth, createItem);
router.get('/', auth, getItems);
router.delete('/:id', auth, isAdmin, deleteItem);


router.post('/upload', auth,  upload.single('image'), (req, res) => {
    try {
        const filename = req.file.filename;
        res.status(200).json({ success: true, filename });
    } catch (error) {
        console.error('item route:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/:itemId/update-image', auth, fetchItemCode, upload.single('image'), updateItemImage);

export default router;