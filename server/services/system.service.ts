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
import SystemSetting from '../models/systemSetting.model.js';

import { AppError } from '../errors/AppError.js';
import { clearAllTransfers } from './transfer.service.js';

const MAX_RESTORE_BYTES = 500 * 1024 * 1024; // uncompressed size guard against zip bombs
const DEFAULT_IMAGE = 'default.jpg';
const SAFE_IMAGE_NAME = /^[\w-]+\.(png|jpe?g|webp|gif)$/i;

export const streamBackupToClient = async (outputStream: Writable) => {
    const dbData = {
        // Password hashes are excluded from queries by default, but a restore needs them
        users: await User.find({}).select('+password'),
        items: await Item.find({}),
        locations: await Location.find({}),
        inventory: await Inventory.find({}),
        transfers: await Transfer.find({}),
        transactions: await Transaction.find({}),
        tempTransfers: await TempTransfer.find({}),
        settings: await SystemSetting.find({}),
        meta: { date: new Date(), version: "2.1" }
    };

    const archive = archiver('zip', { zlib: { level: 9 } });
    const finished = new Promise<void>((resolve, reject) => {
        archive.on('error', reject);
        outputStream.on('error', reject);
        outputStream.on('finish', resolve);
    });

    archive.pipe(outputStream);
    archive.append(JSON.stringify(dbData, null, 2), { name: 'database_dump.json' });

    const itemsDir = path.join(process.cwd(), 'uploads', 'items');
    if (fs.existsSync(itemsDir)) {
        archive.directory(itemsDir, 'uploads/items');
    }

    await archive.finalize();
    await finished;
};

export const restoreFromBackup = async (zipPath: string) => {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const totalSize = zipEntries.reduce((sum, entry) => sum + (entry.header.size || 0), 0);
    if (totalSize > MAX_RESTORE_BYTES) {
        throw new AppError("Backup is too large to restore", 400);
    }

    const dbEntry = zipEntries.find(entry => entry.entryName === 'database_dump.json' && !entry.isDirectory);
    if (!dbEntry) throw new AppError("Invalid Backup: 'database_dump.json' missing", 400);

    let dbData: any;
    try {
        dbData = JSON.parse(dbEntry.getData().toString('utf8'));
    } catch {
        throw new AppError("Invalid Backup: 'database_dump.json' is not valid JSON", 400);
    }

    // A backup without an admin would leave the system open to the first-run setup takeover
    const hasAdmin = Array.isArray(dbData.users)
        && dbData.users.some((u: any) => u?.role === 'admin' && u?.isActive !== false);
    if (!hasAdmin) {
        throw new AppError("Invalid Backup: it must contain at least one active admin user", 400);
    }

    // Stage images first so a bad archive fails before the database is touched
    const imageEntries = zipEntries.filter(entry => {
        const fileName = path.basename(entry.entryName);
        const isJunk = entry.entryName.includes('__MACOSX') || fileName.startsWith('.');
        return !entry.isDirectory && !isJunk && SAFE_IMAGE_NAME.test(fileName);
    });
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const targetItemsDir = path.join(uploadsDir, 'items');
    const stagingDir = path.join(uploadsDir, `restore-${Date.now()}`);
    if (imageEntries.length > 0) {
        fs.mkdirSync(stagingDir, { recursive: true });
        for (const entry of imageEntries) {
            fs.writeFileSync(path.join(stagingDir, path.basename(entry.entryName)), entry.getData());
        }
    }

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            await Transaction.deleteMany({}, { session });
            await Transfer.deleteMany({}, { session });
            await Inventory.deleteMany({}, { session });
            await TempTransfer.deleteMany({}, { session });
            await Item.deleteMany({}, { session });
            await Location.deleteMany({}, { session });
            await User.deleteMany({}, { session });

            if(dbData.users?.length) await User.insertMany(dbData.users, { session });
            if(dbData.locations?.length) await Location.insertMany(dbData.locations, { session });
            if(dbData.items?.length) await Item.insertMany(dbData.items, { session });
            if(dbData.inventory?.length) await Inventory.insertMany(dbData.inventory, { session });
            if(dbData.transfers?.length) await Transfer.insertMany(dbData.transfers, { session });
            if(dbData.transactions?.length) await Transaction.insertMany(dbData.transactions, { session });
            if(dbData.tempTransfers?.length) await TempTransfer.insertMany(dbData.tempTransfers, { session });
            if(dbData.settings?.length) {
                await SystemSetting.deleteMany({}, { session });
                await SystemSetting.insertMany(dbData.settings, { session });
            }
        });
    } catch (error) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
        throw error;
    } finally {
        await session.endSession();
    }

    // Database committed: swap the staged images in, keeping the default image if the backup lacks it
    if (imageEntries.length > 0) {
        const defaultImage = path.join(targetItemsDir, DEFAULT_IMAGE);
        if (fs.existsSync(defaultImage) && !fs.existsSync(path.join(stagingDir, DEFAULT_IMAGE))) {
            fs.copyFileSync(defaultImage, path.join(stagingDir, DEFAULT_IMAGE));
        }
        fs.rmSync(targetItemsDir, { recursive: true, force: true });
        fs.renameSync(stagingDir, targetItemsDir);
    }
};

// Wipes all data except admin accounts (always including the one who requested it), so the
// system never falls back into first-run setup mode, where anyone could create an admin.
export const executeFactoryReset = async (keepUserId: string) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            await Transaction.deleteMany({}, { session });
            await Transfer.deleteMany({}, { session });
            await Inventory.deleteMany({}, { session });
            await TempTransfer.deleteMany({}, { session });
            await Item.deleteMany({}, { session });
            await Location.deleteMany({}, { session });
            await User.deleteMany({ role: { $ne: 'admin' }, _id: { $ne: keepUserId } }, { session });
        });
    } finally {
        await session.endSession();
    }

    // Remove uploaded images but keep the shared default image
    const itemsDir = path.join(process.cwd(), 'uploads', 'items');
    if (fs.existsSync(itemsDir)) {
        for (const file of fs.readdirSync(itemsDir)) {
            if (file !== DEFAULT_IMAGE) {
                fs.rmSync(path.join(itemsDir, file), { recursive: true, force: true });
            }
        }
    }
};

export const clearSpecificData = async (target: 'transfers' | 'items') => {
    if (target === 'transfers') {
        await clearAllTransfers();
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