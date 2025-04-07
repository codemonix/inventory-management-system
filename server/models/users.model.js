import mongoose from 'mongoose'
import { type } from 'os'

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true }, // Could be required as well
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    },
    { timestamp: true }
);

const User = new mongoose.model('User', userSchema);
export default User;