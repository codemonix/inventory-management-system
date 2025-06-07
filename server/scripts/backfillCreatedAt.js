import mongoose from "mongoose";
import dotenv from 'dotenv';
import Item from "../models/item.model.js";

dotenv.config();

await mongoose.connect(process.env.DB_URI);

const items = await Item.find({ createdAt: { $exists: false }}); 

for ( const item of items ) {
    item.createdAt = item._id.getTimestamp();
    await item.save();
}

console.log(`✅ Backfilled ${items.length} items`);
process.exit();
