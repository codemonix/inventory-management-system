import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';
import { Writable } from 'stream';

import User from '../models/users.model.js';
import Item from '../models/item.model.js';
import Location from '../models/location.model.js';
import Inventory from '../models/inventory.model.js';
import Transfer from '../models/transfer.model.js';
import Transaction from '../models/transaction.model.js';
import TempTransfer from '../models/tempTransfer.model.js';

import { AppError } from '../errors/AppError.js';

export const streamBackupToClient = async (outputStream: Writable) => {
    const dbData = {
        users: await User.find({}),
        items: await Item.find({}),
        locations: await Location.find({}),
        inventory: await Inventory.find({}),
        transfers: await Transfer.find({}),
        transactions: await Transaction.find({}),
        tempTransfers: await TempTransfer.find({}),
        meta: { date: new Date(), version: "2.0" }
    };

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(outputStream);
    archive.append(JSON.stringify(dbData, null, 2), { name: 'database_dump.json' });

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, 'uploads');
    }

    await archive.finalize();
};

export const restoreFromBackup = async (zipPath: string) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        const dbEntry = zipEntries.find(entry => entry.entryName === 'database_dump.json' && !entry.isDirectory);
        if (!dbEntry) throw new AppError("Invalid Backup: 'database_dump.json' missing", 400);

        const dbData = JSON.parse(dbEntry.getData().toString('utf8'));

        // Wipe DB safely inside transaction
        await Transaction.deleteMany({}, { session });
        await Transfer.deleteMany({}, { session });
        await Inventory.deleteMany({}, { session });
        await TempTransfer.deleteMany({}, { session });
        await Item.deleteMany({}, { session });
        await Location.deleteMany({}, { session });
        await User.deleteMany({}, { session });

        // Insert new data
        if(dbData.users?.length) await User.insertMany(dbData.users, { session });
        if(dbData.locations?.length) await Location.insertMany(dbData.locations, { session });
        if(dbData.items?.length) await Item.insertMany(dbData.items, { session });
        if(dbData.inventory?.length) await Inventory.insertMany(dbData.inventory, { session });
        if(dbData.transfers?.length) await Transfer.insertMany(dbData.transfers, { session });
        if(dbData.transactions?.length) await Transaction.insertMany(dbData.transactions, { session });

        // Restore filesystem
        const targetItemsDir = path.join(process.cwd(), 'uploads', 'items');
        
        const imageEntries = zipEntries.filter(entry => {
            const isImage = entry.entryName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isJunk = entry.entryName.includes('__MACOSX') || entry.entryName.startsWith('.');
            return isImage && !isJunk;
        });

        if (imageEntries.length > 0) {
            if (targetItemsDir.length > 20) { 
                if (fs.existsSync(targetItemsDir)) fs.rmSync(targetItemsDir, { recursive: true, force: true });
                fs.mkdirSync(targetItemsDir, { recursive: true });
            }

            imageEntries.forEach(entry => {
                const fileName = path.basename(entry.entryName);
                if (!fileName) return;
                fs.writeFileSync(path.join(targetItemsDir, fileName), entry.getData());
            });
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error; 
    } finally {
        session.endSession();
    }
};

export const executeFactoryReset = async () => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        await Transaction.deleteMany({}, { session });
        await Transfer.deleteMany({}, { session });
        await Inventory.deleteMany({}, { session });
        await TempTransfer.deleteMany({}, { session });
        await Item.deleteMany({}, { session });
        await Location.deleteMany({}, { session });
        await User.deleteMany({}, { session });

        await session.commitTransaction();

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (fs.existsSync(uploadsDir)) {
            fs.rmSync(uploadsDir, { recursive: true, force: true });
            fs.mkdirSync(uploadsDir);
            fs.mkdirSync(path.join(uploadsDir, 'items'), { recursive: true });
        }
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const clearSpecificData = async (target: 'transfers' | 'items') => {
    if (target === 'transfers') {
        await Transfer.deleteMany({});
        await TempTransfer.deleteMany({});
    } else if (target === 'items') {
        const hasInventory = await Inventory.exists({});
        if(hasInventory) {
            throw new AppError("Cannot delete items while stock exists.", 400);
        }
        await Item.deleteMany({});
    } else {
        throw new AppError("Invalid target specified.", 400);
    }
};