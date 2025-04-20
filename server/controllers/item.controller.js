
import Item from "../models/item.model.js";
import { nanoid } from "nanoid";

export async function createItem(req, res) {
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
        console.log('newItem:', newItem);
        res.status(201).json({ message: 'Item created successfully', item: savedItem});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create item.' });
    }
}

export async function getItems(req, res) {
    try {
        const items = await Item.find();
        res.status(200).json(items)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fail to fetch items.'});
    }
}