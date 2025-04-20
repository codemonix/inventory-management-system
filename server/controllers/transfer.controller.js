
import TransferPackage from '../models/transfer.model.js';
import Inventory from '../models/inventory.model.js';

export const createTransfer = async ( req, res ) => {
    try {
        console.log('Incomming transfer payload:', req.body);
        const { fromLocation, toLocation, items } = req.body;
        if ( fromLocation === toLocation ) {
            return res.status(400).json({ message: 'Source and destination must be different.' });
        }

        if (items.length === 0 ) {
            return res.status(400).json({ error: "transfer package is empty."})
        }

        const updates = [];

        for ( const { item, quantity } of items ) {
            console.log('item, quantity transfer controller:', item, quantity);
            const sourceStock = await Inventory.findOne({ itemId: item, locationId: fromLocation});
            console.log('sourceStock:', sourceStock);
            if (!sourceStock || sourceStock.quantity < quantity) {
                return res.status(400).json({ message: `Insufficient stock for item ${item}`});
            }

            //Deduct from source
            sourceStock.quantity -= quantity;
            updates.push(sourceStock.save());
        }

        await Promise.all(updates);

        // Create transfer with pending status
        const transfer = await TransferPackage.create({
            fromLocation,
            toLocation,
            items,
            createdBy: req.user.id,
            status: 'in_transit',
        });

        res.status(201).json({ message: 'Transfer initiated successfully.', transfer });
    } catch (error) {
        console.error(error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Confirm transfer received at destination
export const confirmTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const transfer = TransferPackage.findById(transferId);

        if (!transfer) {
            res.status(400).json({ message: 'Transfer not found' });
        }

        if (transfer.status !== 'in_transit') {
            return res.status(400).json({ message: 'Transfer already completed or canceled'});
        }

        // add items to destination
        const updates =[];
        for (const { item, quantity } of transfer.items) {
            const destStock = await Inventory.findOne({ item, location: transfer.toLocation });


            if (destStock) {
                destStock.quantity += quantity;
                updates.push(destStock.save());
            } else {
                updates.push(Inventory.create({
                    item,
                    location: transfer.toLocation,
                    quantity
                }));
            }
        }
        await Promise.all(updates);

        // Update transfer status to received
        transfer.status = 'received';
        await transfer.save();

        res.status(200).json({ message: 'Transfer received and stock updated', transfer });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to confirm transfer' });
    }
};

// Get all transfers

export const getAllTransfers = async (req, res) => {
    try {
        const transfers = await TransferPackage.find()
            .populate('fromLocation')
            .populate('toLocation')
            .populate('items.item')
            .populate('createdBy', 'email role');
        res.json(transfers);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to fetch transfers'});
    }
};