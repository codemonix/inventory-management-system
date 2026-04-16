import { Logger as WinstonLogger } from 'winston';

export type LogLevel = 'error' | 'warn' | 'http' | 'info' | 'debug';

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