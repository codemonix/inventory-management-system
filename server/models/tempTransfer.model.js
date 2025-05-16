import mongoose from 'mongoose';


const tempTransferSchema = new mongoose.Schema({
    fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true },
        },
    ],
}, { timeStamps: true });

export default mongoose.model('TempTransfer', tempTransferSchema);