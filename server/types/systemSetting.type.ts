import { Document } from "mongoose";

export interface ISystemSetting extends Document {
    _id: string;
    logLevel: string;
    enableDbLogging: boolean;
    createdAt: Date;
    updatedAt: Date;
}