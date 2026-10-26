import 'dotenv/config';
import mongoose from 'mongoose';
import Item from '../models/item.model.js';
import logger from '../utils/logger.js';

const dbUri = process.env.DB_URI;
if (!dbUri) {
  logger.error('❌ DB_URI environment variable is missing.');
  process.exit(1);
}

(async () => {
  try {
    logger.info('connecting to db...');
    await mongoose.connect(dbUri);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(message);
    logger.info('error, exiting...');
    process.exit(1);
  }

  const items = await Item.find({ nameLower: { $exists: false } });

  for (const item of items) {
    item.nameLower = item.name.toLowerCase();
    await item.save();
    // eslint-disable-next-line no-console
    console.log(`item ${item.name} updated`);
  }

  // eslint-disable-next-line no-console
  console.log(`Updated ${items.length} items`);
  process.exit(0);
})();

