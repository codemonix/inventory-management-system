import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
        console.log('upload.js -> itemFilename:', itemFilename);
        cb( null, itemFilename);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb ) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        console.log('upload.js -> file, req.body:', file, req.body);
        const ext = path.extname(file.originalname).toLowerCase();
        console.log('upload.js -> ext:', ext);
        if (!allowedExt.includes(ext)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb( null, true );
    }
});