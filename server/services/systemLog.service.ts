import { FilterQuery } from 'mongoose';
import SystemLog from '../models/systemLog.model.js';
import SystemSetting from '../models/systemSetting.model.js';
import logger, { updateLoggerSettings } from '../utils/logger.js';
import {
    IGetLogsParams,
    IGetLogsResult,
    ISystemLog,
    ISystemSetting
} from '../types/system.types.js';



export const getLogs = async ({ 
    page = 1, 
    limit = 50, 
    level = 'all', 
    type,
    search,
    sortBy = 'timestamp',
    sortOrder = 'desc',
    }: IGetLogsParams): Promise<IGetLogsResult> => {
        
    logger.debug('Fetching system logs');
    logger.debug( `page: ${page}, limit: ${limit}, level: ${level}, type: ${type}`)
    const safePage = Math.max(1, page);
    const skip = (safePage -1) * limit;
    const query: FilterQuery<ISystemLog> = {};
    
    if (level && level !== 'all') query.level = level;
    if (type) query['meta.type'] = type;
    if (search) query.message = { $regex: search, $options: 'i'};
    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy) {
        sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions.timestamp = -1;
    }



    logger.debug('systemLogservice -> getLogs -> query:', query)
    const logs = await SystemLog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

    const total = await SystemLog.countDocuments(query);
    logger.info('System logs fetched');
    logger.debug('systemLogservice -> getLogs -> System logs length:', logs.length)
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

export const getSettings = async (): Promise<ISystemSetting> => {
    let settings: ISystemSetting | null = await SystemSetting.findById('global_settings');
    
    if (!settings) {
        settings = (await SystemSetting.create({
            _id: 'global_settings',
            logLevel: 'info',
            enableDbLogging: true
        })) as ISystemSetting;
    }
    logger.info('System settings fetched');
    return settings;
};

export const updateSettings = async (
    logLevel: string, 
    enableDbLogging: boolean
): Promise<ISystemSetting | null> => {
    const settings: ISystemSetting | null = await SystemSetting.findByIdAndUpdate(
        'global_settings',
        { logLevel, enableDbLogging },
        { new: true, upsert: true }
    );

    // Update Winston dynamically
    if (settings) {
        updateLoggerSettings({
            level: settings.logLevel,
            enableDbLogging: settings.enableDbLogging
        })
    }
    
    logger.info('System settings updated');
    return settings;
};