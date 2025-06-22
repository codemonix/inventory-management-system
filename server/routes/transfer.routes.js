
import express from 'express';
import { createTransfer, getAllTransfers, confirmTransfer } from '../controllers/transfer.controller.js';
import  auth  from '../middleware/auth.middleware.js';
import { getTempTransfer, 
    createTempTransfer, 
    addItemToTempTransfer, 
    removeItemFromTempTransfer, 
    finalizeTempTransfer
 } from '../controllers/transfer.controller.js';

const router = express.Router();

// Temp Transfer Routes
router.get('/temp', auth, getTempTransfer);
router.post('/temp/init', auth, createTempTransfer);
router.post('/temp/add', auth, addItemToTempTransfer);
router.delete('/temp/remove/:itemId', auth, removeItemFromTempTransfer);
router.post('/temp/finalize', auth, finalizeTempTransfer);

router.post('/', auth, createTransfer);
router.put('/:id/confirm', auth, confirmTransfer);
router.get('/', auth, getAllTransfers);

export default router;