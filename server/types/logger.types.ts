import { Logger as WinstonLogger } from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export type LogLevelsMap = Record<LogLevel, number>;

export interface ILoggerConfig {
    level: LogLevel; 
    enableDbLogging: boolean;
    dbUri: string | null;
}

export interface IMSLogger extends Omit<WinstonLogger, 'stream'> {
    stream: {
        write: (message: string) => void;
    };
}