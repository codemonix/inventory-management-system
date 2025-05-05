
import express from 'express';
import { upload } from '../utils/upload.js';
import  auth, { isAdmin } from '../middleware/auth.middleware.js';
import { getInventory, updateInventory, deleteInventory, createInventory, addStock, removeStock} from "../controllers/inventory.controller.js"


const router = express.Router();

router.get('/', auth, getInventory);
router.post('/', auth, upload.single('image'),  createInventory);
router.put('/:itemId/quantity', auth, updateInventory);
router.delete('/:id', isAdmin, deleteInventory);
router.post('/:itemId/in', auth, addStock);
router.post('/:itemId/out', auth, removeStock);

export default router;