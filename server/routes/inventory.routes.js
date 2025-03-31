import express from 'express';
import Inventory from '../models/inventory.model';
const router = express.Router();

// Get all inventor items
router.get('/', async(req, res) => {
    try {
        const items = Inventory.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Add new inventory item
router.post('/', async(req, res) => {
    const {name, quantity, location, desciption } = req.body;

    try { 
        const newItem = new Inventory({name, quantity, location, desciption });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

export default router;

