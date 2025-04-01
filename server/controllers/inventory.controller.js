import Inventory from "../models/inventory.model";


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

// Add new item
export const createInventory = async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

// Upfate item

export const updateInventory = async (req, res) => {
    try { 
        const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedItem) return res.status(404).json({ message: "Item not found"});
        res.json(updatedItem);
    } catch (error) {
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