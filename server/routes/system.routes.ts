import express, { RequestHandler } from 'express';
import { uploadBackup } from '../utils/upload.js';

// Import from the Telemetry Controller
import { 
    getSystemLogs, 
    clearSystemLogs, 
    getSystemSettings, 
    updateSystemSettings 
} from '../controllers/systemLog.controller.js';

// Import from the Infrastructure Controller
import { 
    createBackup, 
    restoreBackup, 
    factoryReset, 
    clearData 
} from '../controllers/system.controller.js';

// Middleware
import auth, { isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();


// ==========================================
// TELEMETRY & SETTINGS ROUTES
// ==========================================
router.get('/logs', auth, isAdmin, getSystemLogs as unknown as RequestHandler);
router.delete('/logs', auth, isAdmin, clearSystemLogs as unknown as RequestHandler);
router.get('/settings', auth, isAdmin, getSystemSettings as unknown as RequestHandler);
router.put('/settings', auth, isAdmin, updateSystemSettings as unknown as RequestHandler);

// ==========================================
// INFRASTRUCTURE & BACKUP ROUTES
// ==========================================
router.get('/backup', auth, isAdmin, createBackup as unknown as RequestHandler);
router.post('/restore', auth, isAdmin, uploadBackup.single('backupFile'), restoreBackup as unknown as RequestHandler);
router.post('/reset', auth, isAdmin, factoryReset as unknown as RequestHandler);
router.post('/clear', auth, isAdmin, clearData as unknown as RequestHandler);

export default router;