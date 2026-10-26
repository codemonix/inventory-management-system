import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import Item from '../models/item.model.js';

const dbUri = process.env.DB_URI;
if (!dbUri) {
  // eslint-disable-next-line no-console
  console.error('❌ DB_URI environment variable is missing.');
  process.exit(1);
}

await mongoose.connect(dbUri);

const items = await Item.find({ createdAt: { $exists: false } });

for (const item of items) {
  const id = item._id as unknown as Types.ObjectId;
  item.createdAt = id.getTimestamp();
  await item.save();
}

// eslint-disable-next-line no-console
console.log(`✅ Backfilled ${items.length} items`);
process.exit(0);

