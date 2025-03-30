import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        quantity: {type: Number, required: true},
        locations: [
            {
                location: { type: String, required: true},
                quantity: { type: Number, required: true, min: 0 },
            },
        ],
        description: {type: String },
    },
    { timestamps: true}
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;