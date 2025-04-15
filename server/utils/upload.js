import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';


const storage = multer.diskStorage({
    destination: ( req, file, cb ) => {
        const uploadDir = 'uploads/items';
        fs.mkdirSync( uploadDir, { recursive: true });
        cb( null, uploadDir );
    },
    filename: ( req, file, cb ) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const itemCode = req.body.itemCode || nanoid(10);
        cb( null, `${itemCode}${ext}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb ) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExt.includes(ext)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb( null, true );
    }
});