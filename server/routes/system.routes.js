
import express from 'express';
// import multer from 'multer';
import { createBackup, restoreBackup, clearData, factoryReset } from '../controllers/system.controller.js';
import auth, { isAdmin } from '../middleware/auth.middleware.js';
import { uploadBackup } from '../utils/upload.js';

const router = express.Router();

// const uploadBackup = multer({
//     dest: 'uploads/temp/',
//     limits: { filesize: 100 * 1024 * 1024}
// })

router.get('/backup', auth, isAdmin, createBackup);
router.post('/restore', auth, isAdmin, uploadBackup.single('backupFile'), restoreBackup);
router.post('/clear', auth, isAdmin, clearData);
router.post('/reset', auth, isAdmin, factoryReset);

export default router;