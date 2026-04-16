import mongoose, { Schema } from 'mongoose';
import { IInventory } from '../types/inventory.types.js';



const inventorySchema = new Schema<IInventory>({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    }

},
{ timestamps: true });

inventorySchema.index( { itemId: 1, locationId: 1 }, { unique: true });

const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
export default Inventory;