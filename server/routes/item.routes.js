
import express from 'express';
import { upload } from '../utils/upload.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', auth,  upload.single('image'), (req, res) => {
    try {
        const filename = req.file.filename;
        res.status(200).json({ success: true, filename });
    } catch (error) {
        console.error('item route:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;