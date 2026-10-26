import { Document } from "mongoose";
import { LogLevel } from "./logger.types.js";

export interface ISystemSetting extends Document<string> {
    _id: string;
    logLevel: LogLevel;
    enableDbLogging: boolean;
    // Shows the demo-account button on the login page
    demoMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}