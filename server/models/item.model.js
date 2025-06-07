

import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
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

itemSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.name) {
        update.nameLower = update.name.toLowerCase();
        this.setUpdate(update);
    }
    next();
})

const Item = new mongoose.model('Item', itemSchema);
export default Item;

