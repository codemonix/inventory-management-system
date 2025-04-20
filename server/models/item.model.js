

import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        code: { type: String, required: true, unique: true },
        imageUrl: { type: String },
        category: { type: String },
        price: { type: Number},
    },
    { timeStamps: true },
);

const Item = new mongoose.model('Item', itemSchema);
export default Item;

