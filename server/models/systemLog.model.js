import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    level: { type: String, required: true},
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed }
});

// The TTL Index: Automatically delete logs after 7 days (604,800 seconds)
systemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model('SystemLog', systemLogSchema);