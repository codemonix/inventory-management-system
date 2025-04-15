
import Inventory from "../models/inventory.model.js";
import { nanoid } from "nanoid";
import path from 'path';
import fs from 'fs';


export async function createItem(res, res) {
    try {
        const { name , description } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }


        const itemCode = nanoid(10); //unique item code
        const ext = path.extname(req.file.originalname).toLowerCase();   //get image extension
        const imageUrl = `/uploads/items/${itemCode}${ext}`;
        const oldPath = req.file.path;
        const newPath = path.resolve(`uploads/items/${itemCode}${ext}`);
        fs.renameSync(oldPath, newPath);

        const newItem = new Inventory({
            name,
            description,
            itemCode,
            imageUrl,
            location: []
        });

        await newItem.save();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create inventory item.' });
    }
}

// fetch all items
export const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find();

        // total quntity for each item
        const updatedItems = items.map( item => ({
            ...item.toObject(), 
            totalQuantity: item.locations.reduce((sum, loc) => sum + loc.quantity, 0)
        }));
        res.json(updatedItems);
    } catch (error) {
        res.status(500).json({message: error.message});
    };
};


// Update item

export const updateInventory = async (req, res) => {
    try { 
        const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedItem) return res.status(404).json({ message: "Item not found"});
        res.json(updatedItem);
    } catch (error) {
        console.error("Update inventory:", error)
        res.status(500).json({ message: error.message });
    };
};

export const deleteInventory = async (req, res) => {
    try {
        const deleteItem = await Inventory.findByIdAndDelete(req.params.id);
        if (!deleteItem) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};