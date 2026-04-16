
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { upload } from '../utils/upload.js'; 
import logger from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';

export const handleImageUpload = (req: Request, res: Response, next: NextFunction): void => {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            logger.warn(`handleImageUpload -> Multer Error: ${err.message}`);
            return next(new AppError(err.message, 400));
        } else if (err) {
            logger.warn(`handleImageUpload -> Custom Error: ${err.message}`);
            return next(new AppError(err.message, 400));
        }
        next();
    });
};