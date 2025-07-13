import multer from 'multer';
import path from 'path';
import fs from 'fs';
import debugLog from './logger.js';
// import { nanoid } from 'nanoid';


const storage = multer.diskStorage({
    destination: ( req, file, cb ) => {
        const uploadDir = 'uploads/items';
        fs.mkdirSync( uploadDir, { recursive: true });
        cb( null, uploadDir );
    },
    filename: ( req, file, cb ) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const itemCode = req.itemCode;
        const itemFilename = `${itemCode}${ext}`;
        debugLog('upload.js -> itemFilename:', itemFilename);
        cb( null, itemFilename);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb ) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        debugLog( file, req.body );
        const ext = path.extname(file.originalname).toLowerCase();
        debugLog( ext );
        if (!allowedExt.includes(ext)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb( null, true );
    }
});