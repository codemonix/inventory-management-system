
import TransferPackage from '../models/transfer.model.js';
import Inventory from '../models/inventory.model.js';
import tempTransferModel from '../models/tempTransfer.model.js';
import { debugLog } from '../utils/logger.js';


export const getTempTransfer = async (req, res) => {
    const temp = await tempTransferModel.findOne();
    res.json(temp);
};

export const createTempTransfer = async (req, res) => {
    const { fromLocation, toLocation } = req.body;
    const existing = await tempTransferModel.findOne();
    if (existing) await existing.deleteOne();
    const temp = new tempTransferModel({ fromLocation, toLocation, items: [] });
    await temp.save();
    res.status(201).json(temp);
};

// Add item to temp transfer
export const addItemToTempTransfer = async (req, res) => {
    const { itemId, quantity, sourceLocationId } = req.body;
    const temp = await tempTransferModel.findOne();
    if (!temp) {
        return res.status(404).json({ message: 'Temp transfer not found' });
    }
    if (temp.fromLocation.toString() !== sourceLocationId) {
        return res.status(400).json({ message: "Item is from a different location than the transfer source"})
    }
    const exist = temp.items.find(item => item.itemId.toString() === itemId)
    if (exist) {
        exist.quantity += quantity;
    } else {
        temp.items.push({ itemId, quantity });
    }
    await temp.save();
    res.status(201).json(temp);
};

// Remove item from temp transfer
export const removeItemFromTempTransfer = async (req, res) => {
    const { itemId } = req.params;
    const temp = await tempTransferModel.findOne();
    if (!temp) {
        return res.status(404).json({ message: 'Temp transfer not found' });
    }
    temp.items = temp.items.filter(item => item.itemId.toString() !== itemId);
    await temp.save();
    res.status(200).json(temp);
};

// Finalize temp transfer
export const finalizeTempTransfer = async (req, res) => {
    const temp = await tempTransferModel.findOne();
    if (!temp) {
        return res.status(400).json({ message: 'Noting to finalize' });
    }

    const cleanedItems = temp.items.map( i => ({
        item: i.itemId,
        quantity: i.quantity
    }));

    const newTransfer = new TransferPackage({
        fromLocation: temp.fromLocation,
        toLocation: temp.toLocation,
        items: cleanedItems,
        createdBy: req.user.id,
        status: "in_transit"
    });
    try {
        await newTransfer.save();
        await temp.deleteOne();
        res.status(201).json(newTransfer);
    } catch (error) {
        debugLog('temp transfer:', temp);
        debugLog(newTransfer)
        debugLog(error.message);
        return res.status(500).json({ message: 'Failed to save transfer' });
    }
}

export const createTransfer = async ( req, res ) => {
    try {
        log(req.body);
        const { fromLocation, toLocation, items } = req.body;
        if ( fromLocation === toLocation ) {
            return res.status(400).json({ message: 'Source and destination must be different.' });
        }

        if (items.length === 0 ) {
            return res.status(400).json({ error: "transfer package is empty."})
        }

        const updates = [];

        for ( const { item, quantity } of items ) {
            log( item, quantity );
            const sourceStock = await Inventory.findOne({ itemId: item, locationId: fromLocation});
            log('sourceStock:', sourceStock);
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
        log(error.message);
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
        log(error.message);
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
        log(error.message);
        res.status(500).json({ message: 'Failed to fetch transfers'});
    }
};