import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';



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
            logger.debug('upload.js -> Generated Backup Name:', backupName);
            return cb(null, backupName);
        }

        if (req.itemCode) {
            const itemFilename = `${req.itemCode}${ext}`;
            logger.debug('upload.js -> itemFilename:', itemFilename);
            return cb(null, itemFilename);
        }
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb ) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        logger.debug("upload.js -> upload: images");
        logger.debug("upload.js -> upload file:",  file );
        const ext = path.extname(file.originalname).toLowerCase();
        logger.debug("upload.js -> upload ext:", ext );
        if (!allowedExt.includes(ext)) {
            logger.warn("upload.js -> uplod -> Invalid file extension")
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
        logger.debug("upload.js -> uploadBackep: zip");
        const ext = path.extname(file.originalname).toLocaleLowerCase();
        logger.debug("upload.js -> uploadBackup -> ext:", ext);
        if (!allowedExt.includes(ext)) {
            logger.warn("upload.js -> uploadBackup -> Only ZIP files allowed")
            return cb(new Error('Only zip file allowed!'));
        }
        cb(null, true);

    }
})