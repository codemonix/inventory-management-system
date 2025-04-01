import express from 'express';

import { getInventory, createInventory, updateInventory, deleteInventory} from ".inventory.controller.js"


const router = express.Router();

router.route('/')
    .get(getInventory)
    .post(createInventory);
router.route('/:id')
    .put(updateInventory)
    .delete(deleteInventory);

export default router;