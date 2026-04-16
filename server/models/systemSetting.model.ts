import mongoose, { Schema } from 'mongoose';
import { ISystemSetting } from '../types/systemSetting.type.js';


const systemSettingSchema = new Schema<ISystemSetting>({
    // Using a fixed ID so we can always find the single settings document
    _id: { type: String, default: 'global_settings' },
    logLevel: { 
        type: String, 
        enum: ['error', 'warn', 'info', 'debug'], 
        default: 'debug' 
    },
    enableDbLogging: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

const Setting = mongoose.model<ISystemSetting>('Setting', systemSettingSchema);
export default Setting;