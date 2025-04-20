
import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import Item from "../models/item.model.js";
import Location from "../models/location.model.js";

// import { nanoid } from "nanoid";
// import path from 'path';
// import fs from 'fs';


export async function createInventory(req, res) {
    try {
        const { itemId , locationId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ error: "Invalid itemId or locationId."});
        }

        const isExistItem = await Item.findById(itemId);
        const isExistLocation = await Location.findById(locationId);

        if (!isExistItem || !isExistLocation) {
            return res.status(404).json({ error: 'Item or Location not found.'});
        }

        const existing = await Inventory.findOne({ itemId, locationId });

        if ( existing ) {
            return res.status(409).json({ error: "Inventory already exists for this item and location."});
        }

        const newInventory = new Inventory({ itemId, locationId, quantity });
        await newInventory.save();

        res.status(201).json(newInventory);

        // if (!req.file) {
        //     return res.status(400).json({ error: 'Image file is required' });
        // }

        // const itemCode = nanoid(10); //unique item code
        // const ext = path.extname(req.file.originalname).toLowerCase();   //get image extension
        // const imageUrl = `/uploads/items/${itemCode}${ext}`;
        // const oldPath = req.file.path;
        // const newPath = path.resolve(`uploads/items/${itemCode}${ext}`);
        // fs.renameSync(oldPath, newPath);

        // const newItem = new Inventory({
        //     name,
        //     description,
        //     itemCode,
        //     imageUrl,
        //     location: []
        // });

        // await newItem.save();
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message)
        res.status(500).json({message: "Error getting inventory"});
    };
};


// Update item

export const updateInventory = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { locationId, quantity } = req.body;
        console.log('updateInventory', itemId, locationId, quantity)
        const updatedItem = await Inventory.findOneAndUpdate(
            { itemId, locationId },
            { $set: { quantity } },
            { new: true }
        );
        console.log('updateInventory', updatedItem)
        if (!updatedItem) return res.status(404).json({ message: "Inventory record not found for this item and location."});
        res.json(updatedItem);
    } catch (error) {
        // console.error("Update inventory:", error)
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