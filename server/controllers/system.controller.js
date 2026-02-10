import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';

// Import all models to ensure we catch everything
import User from '../models/users.model.js';
import Item from '../models/item.model.js';
import Location from '../models/location.model.js';
import Inventory from '../models/inventory.model.js';
import Transfer from '../models/transfer.model.js';
import Transaction from '../models/transaction.model.js';
import TempTransfer from '../models/tempTransfer.model.js';
import log from '../utils/logger.js';

// --- BACKUP: Stream ZIP (DB JSON + Uploads Folder) ---
export const createBackup = async (req, res) => {
    try {
        // 1. Fetch all data
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

        // 2. Set headers for ZIP download
        const archive = archiver('zip', { zlib: { level: 9 } });
        const fileName = `ims_backup_${new Date().toISOString().split('T')[0]}.zip`;

        res.attachment(fileName);
        archive.pipe(res);

        // 3. Append DB Data
        archive.append(JSON.stringify(dbData, null, 2), { name: 'database_dump.json' });

        // 4. Append Uploads Folder
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (fs.existsSync(uploadsDir)) {
            archive.directory(uploadsDir, 'uploads');
        }

        await archive.finalize();

    } catch (error) {
        log('Backup failed:', error.message);
        if (!res.headersSent) res.status(500).json({ error: 'Backup failed' });
    }
};

// --- RESTORE: ZIP -> Transactional DB Restore + Image Extraction ---
export const restoreBackup = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No backup file uploaded" });

    const zipPath = req.file.path;

    console.log("zipFile path:", zipPath)


    // Start Transaction
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        const zip = new AdmZip(req.file.path);
        const zipEntries = zip.getEntries();

        // 1. Restore Database
        const dbEntry = zipEntries.find(entry => entry.entryName === 'database_dump.json' && !entry.isDirectory);
        if (!dbEntry) throw new Error("Invalid Backup: 'database_dump.json' missing");

        const dbData = JSON.parse(dbEntry.getData().toString('utf8'));

        // Wipe existing data
        await Transaction.deleteMany({}, { session });
        await Transfer.deleteMany({}, { session });
        await Inventory.deleteMany({}, { session });
        await TempTransfer.deleteMany({}, { session });
        await Item.deleteMany({}, { session });
        await Location.deleteMany({}, { session });
        await User.deleteMany({}, { session });

        // Insert new data (preserving _id and passwords)
        if(dbData.users?.length) await User.insertMany(dbData.users, { session });
        if(dbData.locations?.length) await Location.insertMany(dbData.locations, { session });
        if(dbData.items?.length) await Item.insertMany(dbData.items, { session });
        if(dbData.inventory?.length) await Inventory.insertMany(dbData.inventory, { session });
        if(dbData.transfers?.length) await Transfer.insertMany(dbData.transfers, { session });
        if(dbData.transactions?.length) await Transaction.insertMany(dbData.transactions, { session });

        console.log("✅ Database data restored.");

        // const targetItemsDir

        // Commit DB Changes
        await session.commitTransaction();

        // 2. Restore Images (Filesystem)
        const uploadsDir = path.join(process.cwd(), 'uploads');
        console.log("system.controller.js -> restoreBackup -> uploadsDir:", uploadsDir);
        
        // Clean old images
        if (fs.existsSync(uploadsDir)) {
            fs.rmSync(uploadsDir, { recursive: true, force: true });
        }
        fs.mkdirSync(uploadsDir, { recursive: true });

        // Extract 'uploads' folder from ZIP to server root
        console.log("extracting Images")
        
        // 3. RESTORE IMAGES (The Robust Way)
        const targetItemsDir = path.join(process.cwd(), 'uploads', 'items');
        
        console.log("📂 Scanning ZIP for images...");

        // Find ALL images, ignoring where they are inside the zip
        // We filter out __MACOSX which are junk metadata files from Macs
        const imageEntries = zipEntries.filter(entry => {
            const isImage = entry.entryName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isJunk = entry.entryName.includes('__MACOSX') || entry.entryName.startsWith('.');
            return isImage && !isJunk;
        });

        if (imageEntries.length > 0) {
            console.log(`✅ Found ${imageEntries.length} images. Restoring to: ${targetItemsDir}`);

            // 1. Clean the target directory (Safety check: ensure we don't delete system root)
            if (targetItemsDir.length > 20) { // Simple sanity check on path length
                if (fs.existsSync(targetItemsDir)) {
                    fs.rmSync(targetItemsDir, { recursive: true, force: true });
                }
                fs.mkdirSync(targetItemsDir, { recursive: true });
            }

            // 2. Extract images (FLATTENING paths)
            let successCount = 0;
            imageEntries.forEach(entry => {
                try {
                    // We take ONLY the filename (e.g., "chair.jpg") and ignore the folder "uploads/items/"
                    const fileName = path.basename(entry.entryName);
                    
                    // Skip empty filenames (directories sometimes match)
                    if (!fileName) return;

                    const targetPath = path.join(targetItemsDir, fileName);
                    
                    // Write the file
                    fs.writeFileSync(targetPath, entry.getData());
                    successCount++;
                } catch (err) {
                    console.error(`❌ Failed to write ${entry.entryName}:`, err.message);
                }
            });
            console.log(`🎉 Successfully restored ${successCount} images.`);
            
        } else {
            console.warn("⚠️ No images found anywhere in the ZIP file.");
            // DEBUG: Print what WAS found so you can see why it failed
            console.log("First 5 entries found in ZIP:", zipEntries.slice(0, 5).map(e => e.entryName));
        }

        // ... Commit Transaction and End Session ...

        res.json({ message: "System restored successfully." });

    } catch (error) {
        // await session.abortTransaction();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        log('Restore failed:', error.message);
        res.status(500).json({ error: 'Restore failed: ' + error.message });
    } finally {
        session.endSession();
    }
};

// --- FACTORY RESET: Wipe Everything ---
export const factoryReset = async (req, res) => {
    const { confirmation } = req.body;
    if (confirmation !== 'DELETE EVERYTHING') {
        return res.status(400).json({ error: "Invalid confirmation phrase." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Wipe DB
        await Transaction.deleteMany({}, { session });
        await Transfer.deleteMany({}, { session });
        await Inventory.deleteMany({}, { session });
        await TempTransfer.deleteMany({}, { session });
        await Item.deleteMany({}, { session });
        await Location.deleteMany({}, { session });
        await User.deleteMany({}, { session });

        await session.commitTransaction();

        // Wipe Uploads
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (fs.existsSync(uploadsDir)) {
             fs.rmSync(uploadsDir, { recursive: true, force: true });
             fs.mkdirSync(uploadsDir);
             // Recreate subfolders if necessary
             fs.mkdirSync(path.join(uploadsDir, 'items'), { recursive: true });
        }

        res.json({ message: "Factory reset complete." });

    } catch (error) {
        await session.abortTransaction();
        log('Factory Reset failed:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

// --- CLEAR SPECIFIC DATA ---
export const clearData = async (req, res) => {
    const { target } = req.body; // 'transfers' or 'items'
    try {
        if (target === 'transfers') {
            await Transfer.deleteMany({});
            await TempTransfer.deleteMany({});
            res.json({ message: "All transfers history cleared." });
        } else if (target === 'items') {
             // Check for dependencies
             const hasInventory = await Inventory.exists({});
             if(hasInventory) {
                 return res.status(400).json({ error: "Cannot delete items while stock exists." });
             }
             await Item.deleteMany({});
             res.json({ message: "All items deleted." });
        } else {
            res.status(400).json({ error: "Invalid target" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};