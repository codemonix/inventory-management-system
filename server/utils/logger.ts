import { createLogger, format, transports } from "winston";
import { ILoggerConfig, LogLevelsMap, IMSLogger } from "../types/logger.types.js";
import 'winston-mongodb';

// Define strict levels to match your SRM architecture
const levels: LogLevelsMap = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

// Global state for dynamic updates without restarting the server
let currentConfig : ILoggerConfig = {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableDbLogging: true,
    dbUri: null
};

// Console Format 
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf((info) => {
        // Pluck out core fields so they don't print twice
        const { timestamp, level, message, service: _service, ...meta } = info as any;
        const cleanMeta = { ...meta };
        
        // Remove Winston's internal splat symbol
        delete cleanMeta[Symbol.for('splat')];
        
        const metaString = Object.keys(cleanMeta).length
            ? `\nDATA: ${JSON.stringify(cleanMeta, null, 2)}`
            : '';
            
        return `[${timestamp}] ${level}: ${message}${metaString}`;
    })
);

// Database Format 
const dbFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }) 
);

// Create the master logger instance
const logger = createLogger({
    levels,
    level: currentConfig.level,
    defaultMeta: { service: 'ims-api' }, // Tagged for the IMS
    transports: [
        new transports.Console({ format: consoleFormat }),
    ],
}) as unknown as IMSLogger;

// Attach stream for HTTP Middleware
logger.stream = {
    write: (message: string) => {
        const ansiRegex = /[\u001b\x1b]\[[0-9;]*m/g; //eslint-disable-line
        const cleanMessage = message.replace(ansiRegex, '').trim();
        logger.http(cleanMessage)
    },
};

const findMongoTransport = () => logger.transports.find((t: any) => t.name === 'mongodb');

// Initialize MongoDB dynamically after the DB connects
export const initializeDbLogger = (dbUri: string): void => {
    currentConfig.dbUri = dbUri;
    const hasMongoTransport = !!findMongoTransport();
    
    if (!hasMongoTransport && dbUri && currentConfig.enableDbLogging) {
        logger.add(new transports.MongoDB({
            level: currentConfig.level,
            db: dbUri,
            collection: 'systemlogs',
            format: dbFormat,
            metaKey: 'meta', // Stores all extra data neatly inside a 'meta' object
            capped: false 
        }));
        logger.info("MongoDB logging transport initialized.");
    }
};

// Dynamically update settings from the frontend UI
export const updateLoggerSettings = (newConfig: Partial<ILoggerConfig>) => {
    logger.info("Updating logging configuration dynamically...", { newConfig });
    
    currentConfig = { ...currentConfig, ...newConfig };
    
    // Update the master logger level
    logger.level = currentConfig.level;

    // Add or remove the MongoDB transport to match enableDbLogging, then sync its level
    const mongoTransport = findMongoTransport();
    if (!currentConfig.enableDbLogging && mongoTransport) {
        logger.remove(mongoTransport);
        logger.info("MongoDB logging transport disabled.");
    } else if (currentConfig.enableDbLogging && !mongoTransport && currentConfig.dbUri) {
        initializeDbLogger(currentConfig.dbUri);
    } else if (mongoTransport) {
        mongoTransport.level = currentConfig.level;
    }

    logger.debug("Logging configuration successfully updated.");
};

export default logger;