import mongoose from 'mongoose'
import logger, { initializeDbLogger, updateLoggerSettings } from '../utils/logger.js';
import SystemSetting from '../models/systemSetting.model.js';

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            const maskedUri = process.env.DB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
            logger.debug('Attempting to connect to DB at:', maskedUri);
        }
        await mongoose.connect(process.env.DB_URI);
        logger.info('✅ MongoDB connected successfully')
        initializeDbLogger(process.env.DB_URI);

        const settings = await SystemSetting.findById('global_settings');
        if (settings && settings.logLevel) {
            updateLoggerSettings({level: settings.logLevel})
            logger.info(`✅ System log level restored from DB to: ${settings.logLevel}`);
        }

    } catch (error) { 
        logger.error('❌ Database connection error:', error);
        throw error;
    }
}

export default connectDB;