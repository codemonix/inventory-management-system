import mongoose, { Schema, Query } from 'mongoose';
import { IItem } from '../types/item.types.js';


const itemSchema = new Schema<IItem>(
    {
        name: { type: String, required: true, trim: true },
        nameLower: { type: String, required: true, unique: true, lowercase: true },
        code: { type: String, required: true, unique: true },
        imageUrl: { type: String },
        category: { type: String },
        price: { type: Number},
    },
    { timestamps: true },
);

itemSchema.pre('save', function (next) {
    if (this.name) {
        this.nameLower = this.name.toLowerCase();
    }
    next();
})

itemSchema.pre('findOneAndUpdate', function (this: Query<any, any>, next) {
    const update = this.getUpdate() as Record<string, any> | null;

    if (!update) {
        return next();
    }

    if (update.name) {
        update.nameLower = update.name.toLowerCase();
        this.setUpdate(update);
    } else if (update.$set && update.$set.name) {
        update.$set.nameLower = update.$set.name.toLowerCase();
        this.setUpdate(update);
    }
    next();
})

itemSchema.index({ name: 'text'});

const Item = mongoose.model<IItem>('Item', itemSchema);
export default Item;

