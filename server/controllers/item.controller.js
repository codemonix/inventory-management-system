
import Item from "../models/item.model.js";
import Inventory from "../models/inventory.model.js";
import { nanoid } from "nanoid";
import logger from "../utils/logger.js";
import path from 'path';
import fs from 'fs';

export async function createItem(req, res) {
    logger.debug('item.controller -> createItem req.body:', req.body);
    try {
        const { name, category, price } = req.body;

        if (!name) {
            return res.status(400).json({error: 'Name is required!'});
        }

        const itemCode = nanoid(10);
        let imageUrl = req.file? `/uploads/items/${req.file.filename}` : '/uploads/items/default.jpg';
        const nameLower = name.toLowerCase();

        const newItem = new Item({
            name,
            nameLower,
            code: itemCode,
            category,
            price,
            imageUrl
        });
        const savedItem = await newItem.save();
        logger.debug("item.controller -> createItem -> savedItem:", { savedItem });
        res.status(201).json({ message: 'Item created successfully', item: savedItem});
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.nameLower) {
            return res.status(400).json({ message: "Item with this name already exist (case-insensitive)"});
        }
        logger.error("item.controller -> createItem -> error:", error.message);
        res.status(500).json({ error: 'Failed to create item.' });
    }
}

export async function getItems(req, res) {
    logger.debug("item.controller -> getItems -> req.query:", req.query)
    try {
        const page = Math.max( 1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max( 1, parseInt(req.query.limit, 10) || 20);
        const skip = ( page - 1 ) * limit;

        // search
        const search = req.query.search ? req.query.search.trim() : '';

        const filter = {};

        if (search) {
        const escapeRegex = (str) =>
            str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

        filter.name = { $regex: escapeRegex(search), $options: 'i' };
        }


        const sortOptions = {};
        if (req.query.sort) {
            const sortField = req.query.sort.split('_')[0];
            const sortOrder = req.query.sort.split('_')[1] === 'desc' ? -1 : 1;
            sortOptions[sortField] = sortOrder;
        }



        const items = await Item
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await Item.countDocuments(filter);
        return res.status(200).json({ items, totalCount });
    } catch (error) {
        logger.error("item.controller -> getItems -> error:", error.message);
        return res.status(500).json({ error: 'Fail to fetch items.'});
    }
}

export async function getAllItems(req, res) {
    try {
        const items = await Item.find({}).sort({ createdAt: -1 }).lean();
        if (!items || items.length === 0) {
            return res.status(404).json({ error: 'No items found' });
        }
        res.status(200).json({ items });
    } catch (error) {
        logger.error("item.controller -> getAllItems -> error:", error.message);
        res.status(500).json({ error: 'Failed to fetch items' });
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
        logger.error("item.controller -> deleteItem -> error:", error.message);
        res.status(500).json({ error: 'Failed to delete item' });
    }
}

export async function updateItemImage(req, res) {
    try {
        logger.debug("item.controller -> updateItemImage -> ", req.file);

        const { itemId } = req.params;

        if (!req.file || !req.file.filename) {
            logger.warn("item.controller -> updateItemImage -> no file provided in the request");
            return res.status(400).json({ success: false, error: 'No file provided' });
        }

        const filename = req.file.filename;
        logger.debug("item.controller -> updateItemImage ->req.file.filename", { filename });
        const newImageUrl = `/uploads/items/${filename}`;

        // Later delete old image if it is not default.jpg

        const updateItem = await Item.findByIdAndUpdate(
            itemId,
            { imageUrl: newImageUrl },
            { new: true }
        );
        logger.debug("item.controller -> updateItemImage ->", updateItem);
        if (!updateItem) {
            logger.warn("item.controller -> updateItemImage -> item not found", { itemId });
            return res.status(404).json({success: false, error: 'Item not found' });
        }

        return res.status(200).json({ success: true, message: 'Item image updated successfully', item: updateItem });
    } catch (error) {
        logger.error("item.controller -> updateItemImage -> ", { error: error.message });
        return res.status(500).json({ success: false, error: 'Failed to update item image' });
    }
}

export async function updateItem(req, res) {

    try {
        const { itemId } = req.params;
        const { name, category, price } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required!' });
        }

        const updateItem = await Item.findByIdAndUpdate(
            itemId,
            { name, category, price },
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updateItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully', item: updateItem });
    } catch (error) {
        if ( error.code === 11000 && error.keyPattern.nameLower) {
            return res.status(400).json( { message: "Another item already has this name (case-insensitive)"})
        }
        logger.error("item.controller -> updateItem -> error:", error.message);
        res.status(500).json({ error: 'Failed to update item' });
    }
}

export async function getItemImage(req, res) {
    const { filename } = req.params;
    const imagePath = path.join( process.cwd(), 'uploads', 'items', filename );
    logger.debug("imagePath:", imagePath);
    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: 'Image not found!' });
    }

    return res.sendFile(imagePath);
}
    