
import express from 'express';
import { upload } from '../utils/upload.js';
import auth, { isAdmin }  from '../middleware/auth.middleware.js';
import { createItem, getItems, deleteItem } from '../controllers/item.controller.js';

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

export default router;