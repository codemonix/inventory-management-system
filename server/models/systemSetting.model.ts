import mongoose, { Schema } from 'mongoose';
import { ISystemSetting } from '../types/systemSetting.type.js';


const systemSettingSchema = new Schema<ISystemSetting>({
    // Using a fixed ID so we can always find the single settings document
    _id: { type: String, default: 'global_settings' },
    logLevel: { 
        type: String, 
        enum: ['error', 'warn', 'info', 'http', 'debug'], 
        default: 'info' 
    },
    enableDbLogging: { 
        type: Boolean, 
        default: true 
    },
    demoMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Setting = mongoose.model<ISystemSetting>('Setting', systemSettingSchema);
export default Setting;