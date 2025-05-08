
import Item from "../models/item.model.js";
import Inventory from "../models/inventory.model.js";
import { nanoid } from "nanoid";

export async function createItem(req, res) {
    console.log('item controller -> createItem:', req.body);
    try {
        const { name, category, price } = req.body;

        if (!name) {
            return res.status(400).json({error: 'Name is required!'});
        }

        const itemCode = nanoid(10);
        let imageUrl = req.file? `/uploads/items/${req.file.filename}` : '/uploads/items/default.jpg';

        const newItem = new Item({
            name,
            code: itemCode,
            category,
            price,
            imageUrl
        });
        const savedItem = await newItem.save();
        log({ savedItem });
        res.status(201).json({ message: 'Item created successfully', item: savedItem});
    } catch (error) {
        log(error.message);
        res.status(500).json({ error: 'Failed to create item.' });
    }
}

export async function getItems(req, res) {
    try {
        const items = await Item.find();
        res.status(200).json(items)
    } catch (error) {
        log(error.message);
        res.status(500).json({ error: 'Fail to fetch items.'});
    }
}

export async function deleteItem(req, res) {
    try {
        const { id } = req.params;
        const isReferenced = await Inventory.exists({ itemId: id });
        if (isReferenced) {
            return res.status(400).json({ error: 'Item is used in Inventory, cannot be deleted' });
        }
        const item = await Item.findByIdAndDelete(id);
    
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        log(error.message);
        res.status(500).json({ error: 'Failed to delete item' });
    }
}

export async function updateItemImage(req, res) {
    try {
        const { itemId } = req.params;
        const filename = req.file.filename;
        log(req.file.filename);

        // Later delete old image if it is not default.jpg

        const updateItem = await Item.findByIdAndUpdate(
            itemId,
            { imageUrl: `/uploads/items/${filename}` },
            { new: true }
        );
        log(updateItem);
        if (!updateItem) {
            return res.status(404).json({success: false, error: 'Item not found' });
        }

        res.status(200).json({ success: true, message: 'Item image updated successfully', item: updateItem });
    } catch (error) {
        log(error.message);
        res.status(500).json({ success: false, error: 'Failed to update item image' });
    }
}
    