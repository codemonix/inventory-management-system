
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import logger from './logger.js';
import { AppError } from '../errors/AppError.js';

// Define the storage engine
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        let uploadDir = 'uploads/items';

        // Route ZIP files to the temp directory
        if (ext === '.zip') {
            uploadDir = 'uploads/temp';
        }

        // Ensure the directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Generate a unique suffix (Timestamp + random number)
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

        if (ext === '.zip') {
            const backupName = `backup-${uniqueSuffix}${ext}`;
            logger.debug(`upload.ts -> Generated Backup Name: ${backupName}`);
            return cb(null, backupName);
        }

        const itemFilename = `item-${uniqueSuffix}${ext}`;
        logger.debug(`upload.ts -> Generated Image Name: ${itemFilename}`);
        return cb(null, itemFilename);
    }
});

// Image Upload Middleware
export const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        logger.debug("upload.ts -> upload ext:", ext);

        if (!allowedExt.includes(ext)) {
            logger.warn("upload.ts -> upload -> Invalid file extension");
            
            return cb(new AppError('Only image files (.png, .jpg, .jpeg, .webp) are allowed', 400));
        }
        
        cb(null, true);
    }
});

// Backup Upload Middleware
export const uploadBackup = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedExt = ['.zip'];
        const allowedMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];

        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype;

        logger.debug(`upload.ts -> uploadBackup -> ext: ${ext}, mime: ${mimeType}`);
        
        if (!allowedExt.includes(ext)) {
            logger.warn("upload.ts -> uploadBackup -> Only ZIP files allowed");
            return cb(new AppError('Only .zip files are allowed!', 400));
        }

        if (!allowedMimeTypes.includes(mimeType)) {
            logger.warn(`upload.ts -> uploadBackup -> Invalid MIME type: ${mimeType}`);
            return cb(new AppError('File content does not match a valid ZIP format!', 400));
        }
        
        cb(null, true);
    }
});