import { FilterQuery } from 'mongoose';
import SystemLog from '../models/systemLog.model.js';
import SystemSetting from '../models/systemSetting.model.js';
import logger, { updateLoggerSettings } from '../utils/logger.js';
import { AppError } from '../errors/AppError.js';
import { LogLevel } from '../types/logger.types.js';
import { searchRegex } from '../utils/validation.js';

const LOG_LEVELS: readonly LogLevel[] = ['error', 'warn', 'info', 'http', 'debug'];
const LOG_SORT_FIELDS = ['timestamp', 'level', 'message'];
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
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(500, Math.max(1, limit || 50));
    const skip = (safePage -1) * safeLimit;
    const query: FilterQuery<ISystemLog> = {};
    
    if (typeof level === 'string' && level !== 'all') query.level = level;
    if (typeof type === 'string' && type) query['meta.type'] = type;
    const messageRegex = searchRegex(search);
    if (messageRegex) query.message = messageRegex;
    const sortField = LOG_SORT_FIELDS.includes(sortBy) ? sortBy : 'timestamp';
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };



    logger.debug('systemLogservice -> getLogs -> query:', query)
    const logs = await SystemLog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(safeLimit);

    const total = await SystemLog.countDocuments(query);
    logger.info('System logs fetched');
    logger.debug('systemLogservice -> getLogs -> System logs length:', logs.length)
    return {
        logs,
        totalPages: Math.ceil(total / safeLimit),
        currentPage: safePage,
        totalLogs: total
    };
};

// The only settings anyone may read without logging in (used by the login page)
export const getPublicSettings = async (): Promise<{ demoMode: boolean }> => {
    const settings = await SystemSetting.findById('global_settings').select('demoMode').lean();
    return { demoMode: Boolean(settings?.demoMode) };
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

// Partial update: only the fields that are sent are validated and changed.
export const updateSettings = async (input: {
    logLevel?: unknown;
    enableDbLogging?: unknown;
    demoMode?: unknown;
}): Promise<ISystemSetting | null> => {
    const update: Partial<Pick<ISystemSetting, 'logLevel' | 'enableDbLogging' | 'demoMode'>> = {};
    if (input.logLevel !== undefined) {
        if (!LOG_LEVELS.includes(input.logLevel as LogLevel)) {
            throw new AppError(`logLevel must be one of: ${LOG_LEVELS.join(', ')}`, 400);
        }
        update.logLevel = input.logLevel as LogLevel;
    }
    for (const field of ['enableDbLogging', 'demoMode'] as const) {
        if (input[field] === undefined) continue;
        if (typeof input[field] !== 'boolean') {
            throw new AppError(`${field} must be a boolean`, 400);
        }
        update[field] = input[field];
    }
    if (Object.keys(update).length === 0) {
        throw new AppError('Nothing to update', 400);
    }

    const settings: ISystemSetting | null = await SystemSetting.findByIdAndUpdate(
        'global_settings',
        update,
        { new: true, upsert: true, runValidators: true }
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