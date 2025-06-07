
import mongoose from "mongoose";
import Item from "../models/item.model.js";

import dotenv from 'dotenv'

dotenv.config();


( async () => {
    try {
        console.log(process.env.DB_URI);
        await mongoose.connect(process.env.DB_URI);
    } catch (error) {
        console.log(error.message);
        console.log("exiting...");
        process.exit();
    }

    const items = await Item.find({ nameLower: { $exists: false } });

    for (const item of items) {
        item.nameLower = item.name.toLowerCase();
        await item.save();
        console.log(`item ${item.name} updated`)
    }
    console.log(`Updated ${items.length} items`);
    process.exit();
})();