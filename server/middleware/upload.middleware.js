
import multer from 'multer';
import { upload } from '../utils/upload.js'; 
import logger from '../utils/logger.js';

export const handleImageUpload = (req, res, next) => {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            logger.warn(`handleImageUpload -> Multer Error: ${err.message}`);
            return res.status(400).json({ success: false, error: err.message });
        } else if (err) {
            logger.warn(`handleImageUpload -> Custom Error: ${err.message}`);
            
            if (err.message === "ITEM_CODE_MISSING") {
                return res.status(400).json({ success: false, error: 'Item code is required to save the image.' });
            }
            
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};