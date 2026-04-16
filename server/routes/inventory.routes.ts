
import { Router, RequestHandler } from 'express';
import  auth, { isAdmin } from '../middleware/auth.middleware.js';
import { getInventory, getFullInventory, deleteInventory, createInventory, addStock, removeStock} from "../controllers/inventory.controller.js"


const router = Router();

router.get('/', auth, getInventory);
router.get('/full', auth, getFullInventory);
router.post('/', auth,  createInventory);
router.delete('/:id', isAdmin, deleteInventory);
router.post('/:itemId/in', auth, addStock as RequestHandler);
router.post('/:itemId/out', auth, removeStock as RequestHandler);

export default router;