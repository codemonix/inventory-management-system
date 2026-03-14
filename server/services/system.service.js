import SystemLog from '../models/systemLog.model.js';
import SystemSetting from '../models/systemSetting.model.js';
import logger, { updateLoggerSettings } from '../utils/logger.js';

export const getLogs = async ({ page = 1, limit = 50, level, type }) => {
    const skip = (page - 1) * limit;
    const query = {};
    
    if (level && level !== 'all') query.level = level;
    if (type) query['meta.type'] = type;

    const logs = await SystemLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

    const total = await SystemLog.countDocuments(query);
    logger.info('System logs fetched');
    return {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalLogs: total
    };
};

export const clearLogs = async () => {
    logger.info('Clearing system logs');
    return await SystemLog.deleteMany({});
};

export const getSettings = async () => {
    let settings = await SystemSetting.findById('global_settings');
    
    if (!settings) {
        settings = await SystemSetting.create({
            _id: 'global_settings',
            logLevel: 'info',
            enableDbLogging: true
        });
    }
    logger.info('System settings fetched');
    return settings;
};

export const updateSettings = async (logLevel, enableDbLogging) => {
    const settings = await SystemSetting.findByIdAndUpdate(
        'global_settings',
        { logLevel, enableDbLogging },
        { new: true, upsert: true }
    );

    // Update Winston dynamically
    updateLoggerSettings({
        level: settings.logLevel,
        enableDbLogging: settings.enableDbLogging
    })
    logger.info('System settings updated');
    return settings;
};