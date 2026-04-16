import mongoose from 'mongoose'
import logger, { initializeDbLogger, updateLoggerSettings } from '../utils/logger.js';
import SystemSetting from '../models/systemSetting.model.js';
import { LogLevel } from '../types/logger.types.js'

const connectDB = async (): Promise<void> => {
    try {

        const dbUri = process.env.DB_URI;
        if (!dbUri) {
            logger.error("❌ DB_URI environment variable is missing. Halting system boot.");
            process.exit(1);
        }
        if (process.env.NODE_ENV !== 'production') {
            const maskedUri = dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
            logger.debug(`Attempting to connect to DB at: ${maskedUri}`);
        }
        await mongoose.connect(dbUri);
        logger.info('✅ MongoDB connected successfully')
        initializeDbLogger(dbUri);

        const settings = await SystemSetting.findById('global_settings');
        if (settings && settings.logLevel) {
            const savedLevel = settings.logLevel as LogLevel;
            updateLoggerSettings({level: savedLevel});
            logger.info(`✅ System log level restored from DB to: ${savedLevel}`);
        }

    } catch (error) { 
        const errorMesage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Database connection error: ${errorMesage}`);
        throw error;
    }
}

export default connectDB;