import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        locations: [
            {
                location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Storage', required: true},
                quantity: { type: Number, required: true, min: 0 },
            },
        ],
    },
    { timestamps: true}
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;