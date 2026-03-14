import express from 'express';
import { createBackup, restoreBackup, clearData, factoryReset, getSystemSettings, updateSystemSettings, getSystemLogs, clearSystemLogs} from '../controllers/system.controller.js';
import auth, { isAdmin } from '../middleware/auth.middleware.js';
import { uploadBackup } from '../utils/upload.js';

const router = express.Router();

router.get('/backup', auth, isAdmin, createBackup);
router.post('/restore', auth, isAdmin, uploadBackup.single('backupFile'), restoreBackup);
router.post('/clear', auth, isAdmin, clearData);
router.post('/reset', auth, isAdmin, factoryReset);
router.get('/settings', auth, isAdmin, getSystemSettings);
router.put('/settings', auth, isAdmin, updateSystemSettings);
router.get('/logs', auth, isAdmin, getSystemLogs);
router.delete('/logs', auth, isAdmin, clearSystemLogs);


export default router;