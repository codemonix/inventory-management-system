import mongoose from 'mongoose';
import Transfer from '../models/transfer.model.js';
import Inventory from '../models/inventory.model.js';
import TempTransfer from '../models/tempTransfer.model.js';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import { ICreateTempTransferBody, IAddItemToTempBody, ICreateTransferBody } from '../types/transfer.types.js';

export const getTempTransfer = async () => {
    return await TempTransfer.findOne();
};

export const createTempTransfer = async (data: ICreateTempTransferBody) => {
    const existing = await TempTransfer.findOne();
    if (existing) await existing.deleteOne();
    
    const temp = new TempTransfer({ 
        fromLocation: data.fromLocation, 
        toLocation: data.toLocation, 
        items: [] 
    });
    return await temp.save();
};

export const addItemToTempTransfer = async (data: IAddItemToTempBody) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const temp = await TempTransfer.findOne().session(session);
        if (!temp) throw new AppError('Temp transfer not found', 404);
        
        if (temp.fromLocation.toString() !== data.sourceLocationId) {
            logger.warn("Item is from a different location than the transfer source");
            throw new AppError("Item is from a different location than the transfer source", 400);
        }

        const stock = await Inventory.findOne({ 
            itemId: data.itemId, 
            locationId: data.sourceLocationId 
        }).session(session);

        if (!stock || stock.quantity < data.quantity) {
            logger.warn("Insufficient stock");
            throw new AppError('Insufficient stock', 422);
        }

        // Deduct from real stock
        stock.quantity -= data.quantity;
        await stock.save({ session });

        const exist = temp.items.find(item => item.itemId.toString() === data.itemId);
        if (exist) {
            exist.quantity += data.quantity;
        } else {
            temp.items.push({ itemId: data.itemId, quantity: data.quantity });
        }
        
        await temp.save({ session });
        await session.commitTransaction();
        return temp;
    } catch (error) {
        logger.error("transfer.service -> Error in addItemToTempTransfer")
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const removeItemFromTempTransfer = async (itemId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const temp = await TempTransfer.findOne().session(session);
        if (!temp) {
            logger.warn("Temp transfer not found");
            throw new AppError('Temp transfer not found', 404);
        }

        const itemToRemove = temp.items.find(i => i.itemId.toString() === itemId);
        if (!itemToRemove) {
            logger.warn("Item not found in temp transfer");
            throw  new AppError('Item not found in temp transfer', 404);
        } 

        const stock = await Inventory.findOne({ 
            itemId: itemToRemove.itemId, 
            locationId: temp.fromLocation 
        }).session(session);

        if (stock) {
            stock.quantity += itemToRemove.quantity;
            await stock.save({ session });
        }

        temp.items = temp.items.filter(item => item.itemId.toString() !== itemId);
        await temp.save({ session });

        await session.commitTransaction();
        return temp;
    } catch (error) {
        logger.error("transfer.sercive -> Error in removeItemFromTempTransfer");
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const finalizeTempTransfer = async (userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const temp = await TempTransfer.findOne().session(session);
        if (!temp) {
            logger.warn("Temp transfer not found to finalize");
            throw new AppError('Nothing to finalize', 400);
        } 

        const cleanedItems = temp.items.map(i => ({
            item: i.itemId,
            quantity: i.quantity
        }));

        const newTransfer = new Transfer({
            fromLocation: temp.fromLocation,
            toLocation: temp.toLocation,
            items: cleanedItems,
            createdBy: userId,
            status: "in_transit"
        });

        await newTransfer.save({ session });
        await temp.deleteOne({ session });

        await session.commitTransaction();
        return newTransfer;
    } catch (error) {
        logger.error("transfer.service -> Error in finalizeTempTransfer");
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const createDirectTransfer = async (data: ICreateTransferBody, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (data.fromLocation === data.toLocation) {
            logger.warn("Source and destination must be different");
            throw new AppError('Source and destination must be different.', 400);
        }

        if (data.items.length === 0) {
            logger.warn("Transfer package is empty");
            throw new AppError('Transfer package is empty.', 400);
        }

        // Deduct all stock safely
        for (const { item, quantity } of data.items) {
            const sourceStock = await Inventory.findOne({ 
                itemId: item, 
                locationId: data.fromLocation 
            }).session(session);

            if (!sourceStock || sourceStock.quantity < quantity) {
                logger.warn(`Insufficient stock for item ${item}`);
                throw new AppError(`Insufficient stock for item ${item}`, 400);
            }
            sourceStock.quantity -= quantity;
            await sourceStock.save({ session });
        }

        const transfer = new Transfer({
            fromLocation: data.fromLocation,
            toLocation: data.toLocation,
            items: data.items,
            createdBy: userId,
            status: 'in_transit',
        });

        await transfer.save({ session });
        await session.commitTransaction();
        return transfer;
    } catch (error) {
        logger.error("Error in createDirectTransfer");
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const confirmTransferReceived = async (transferId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const transfer = await Transfer.findById(transferId).session(session);
        if (!transfer) {
            logger.warn("Transfer not found to confirm");
            throw new AppError('Transfer not found', 404);
        } 

        if (transfer.status !== 'in_transit') {
            logger.warn("Transfer already completed or canceled");
            throw new AppError('Transfer already completed or canceled', 400);
        }

        // Add items to destination
        for (const { item, quantity } of transfer.items) {
            const destStock = await Inventory.findOne({ 
                itemId: item, 
                locationId: transfer.toLocation 
            }).session(session);

            if (destStock) {
                destStock.quantity += quantity;
                await destStock.save({ session });
            } else {
                await Inventory.create([{
                    itemId: item,
                    locationId: transfer.toLocation,
                    quantity
                }], { session });
            }
        }

        transfer.status = 'confirmed';
        await transfer.save({ session });
        
        await session.commitTransaction();
        return transfer;
    } catch (error) {
        logger.error("Error in confirmTransferReceived");
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getAllTransfers = async () => {
    return await Transfer.find()
        .populate('fromLocation')
        .populate('toLocation')
        .populate('items.item')
        .populate('createdBy', 'email role');
};