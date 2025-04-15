/* the section integrated in inventory model for now */


import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        code: { type: String, required: true, unique: true },
        imageUrl: String,
        category: { type: String },
        price: { type: Number},
    },
    { timeStamp: true },
);

const Item = new mongoose.model('Item', itemSchema);
export default Item;

