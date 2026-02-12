import multer from 'multer';
import path from 'path';
import fs from 'fs';
import debugLog from './logger.js';

// import { nanoid } from 'nanoid';


const storage = multer.diskStorage({
    destination: ( req, file, cb ) => {
        const ext = path.extname(file.originalname).toLocaleLowerCase();

        let uploadDir = 'uploads/items';

        if (ext === '.zip') {
            uploadDir = 'uploads/temp';
        }
        fs.mkdirSync( uploadDir, { recursive: true });
        cb( null, uploadDir );
    },
    filename: ( req, file, cb ) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if ( ext === '.zip') {
            const backupName = `backup-${Date.now()}${ext}`;
            console.log('upload.js -> Generated Backup Name:', backupName);
            return cb(null, backupName);
        }

        if (req.itemCode) {
            const itemFilename = `${req.itemCode}${ext}`;
            console.log('upload.js -> itemFilename:', itemFilename);
            return cb(null, itemFilename);
        }
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb ) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        console.log("upload.js -> upload: images");
        debugLog( file, req.body );
        const ext = path.extname(file.originalname).toLowerCase();
        debugLog( ext );
        if (!allowedExt.includes(ext)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb( null, true );
    }
});

export const uploadBackup = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: ( req, file, cb ) => {
        const allowedExt = ['.zip'];
        console.log("upload.js -> uploadBackep: zip");
        const ext = path.extname(file.originalname).toLocaleLowerCase();
        console.log("upload.js -> uploadBackup -> ext:", ext);
        if (!allowedExt.includes(ext)) {
            return cb(new Error('Onlu zip file allowed!'));
        }
        cb(null, true);

    }
})