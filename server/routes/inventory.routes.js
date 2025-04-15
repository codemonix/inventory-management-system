
import express from 'express';
import { upload } from '../utils/upload.js';
import { auth, isAdmin } from '../middleware/auth.middleware.js';
import { getInventory, createInventory, updateInventory, deleteInventory, createItem} from "../controllers/inventory.controller.js"


const router = express.Router();

router.get('/', auth, getInventory);
router.post('/', auth, upload.single('image'),  createItem);
router.put('/:itemId/quantity', auth, updateInventory);
router.delete('/:id', isAdmin, deleteInventory);

export default router;