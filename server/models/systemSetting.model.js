import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
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

export default mongoose.model('SystemSetting', systemSettingSchema);