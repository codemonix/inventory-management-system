import express, { RequestHandler } from 'express';
import auth from '../middleware/auth.middleware.js'; 
import { 
    createTransfer, 
    getAllTransfers, 
    confirmTransfer,
    getTempTransfer, 
    createTempTransfer, 
    addItemToTempTransfer, 
    removeItemFromTempTransfer, 
    finalizeTempTransfer
} from '../controllers/transfer.controller.js';

const router = express.Router();

// ==========================================
// TEMP TRANSFER ROUTES
// ==========================================
router.get('/temp', auth, getTempTransfer as unknown as RequestHandler);
router.post('/temp/init', auth, createTempTransfer as unknown as RequestHandler);
router.post('/temp/add', auth, addItemToTempTransfer as unknown as RequestHandler);
router.delete('/temp/remove/:itemId', auth, removeItemFromTempTransfer as unknown as RequestHandler);
router.post('/temp/finalize', auth, finalizeTempTransfer as unknown as RequestHandler);

// ==========================================
// DIRECT TRANSFER ROUTES
// ==========================================
router.post('/', auth, createTransfer as unknown as RequestHandler);
router.put('/:id/confirm', auth, confirmTransfer as unknown as RequestHandler);
router.get('/', auth, getAllTransfers as unknown as RequestHandler);

export default router;