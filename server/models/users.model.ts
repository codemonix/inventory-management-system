import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user.types.js';


const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true }, 
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
        isActive: {type: Boolean, default: true},
        isApproved: {type: Boolean, default: false},
        lastLogin: {type: Date},
    },
    
    { timestamps: true }
);

userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compare(password, this.password)
}

const User = mongoose.model<IUser>('User', userSchema);
export default User;