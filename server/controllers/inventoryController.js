import Inventory from "../models/inventoryModel";

export const getInventoryItems = async (req, res) => {
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
    }
}