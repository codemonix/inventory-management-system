
import Transfer from '../models/transfer.model.js';
import Inventory from '../models/inventory.model.js';
import e from 'express';

export const createTransfer = async ( req, res ) => {
    try {
        const { fromLocation, toLocation, items } = req.body;

        if ( fromLocation === toLocation ) {
            return res.status(400).json({ message: 'Source and destination must be different.' });
        }

        const updates = [];

        for ( const { item, quantity } of items ) {
            const sourceStock = await Inventory.findOne({ item, loaction: fromLocation});

            if (!sourceStock || sourceStock.quantity < quantity) {
                return res.status(400).json({ message: `Insufficient stock for item ${item}`});
            }

            //Deduct from source
            sourceStock.quantity -= quantity;
            updates.push(sourceStock.save());
        }

        await Promise.all(updates);

        // Create transfer with pending status
        const transfer = await Transfer.create({
            fromLocation,
            toLocation,
            items,
            createdBy: req.user.id,
            status: 'pending',
        });

        res.status(201).json({ message: 'Transfer initiated successfully.', transfer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Confirm transfer received at destination
export const confirmTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const transfer = Transfer.findById(transferId);

        if (!transfer) {
            res.status(400).json({ message: 'Transfer not found' });
        }

        if (transfer.status !== 'pending') {
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
        console.error(error);
        res.status(500).json({ message: 'Failed to confirm transfer' });
    }
};

// Get all transfers

export const getAllTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.find()
            .populate('fromLocation')
            .populate('toLocation')
            .populate('items.item')
            .populate('createdBy', 'email role');
        res.json(transfers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch transfers'});
    }
};