
import { Router, RequestHandler } from 'express';
import  auth, { isAdmin, isManagerOrAdmin } from '../middleware/auth.middleware.js';
import { getInventory, getFullInventory, getStockTotals, deleteInventory, createInventory, addStock, removeStock} from "../controllers/inventory.controller.js"


const router = Router();

router.get('/', auth, getInventory);
router.get('/full', auth, getFullInventory);
router.get('/totals', auth, getStockTotals);
router.post('/', auth, isManagerOrAdmin, createInventory);
router.delete('/:id', auth, isAdmin, deleteInventory);
router.post('/:itemId/in', auth, addStock as RequestHandler);
router.post('/:itemId/out', auth, removeStock as RequestHandler);

export default router;