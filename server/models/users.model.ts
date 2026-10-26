import mongoose from 'mongoose'
import { IUser } from '../types/user.types.js';


const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true }, 
        // Never returned by queries unless explicitly requested with .select('+password')
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
        isActive: {type: Boolean, default: true},
        isApproved: {type: Boolean, default: false},
        lastLogin: {type: Date},
    },
    
    { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
