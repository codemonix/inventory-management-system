import { timeStamp } from 'console';
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        sku: { type: String, unique: true}, // Could be required as well
        category: { type: String },
        price: { type: Number, required: true },
    },
    { timeStamp: true },
);

const Item = new mongoose.model('Item', itemSchema);
export default Item;

