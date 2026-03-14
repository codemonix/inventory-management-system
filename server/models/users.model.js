import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true }, 
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
        isActive: {type: Boolean, default: true},
        isApproved: {type: Boolean, default: false},
        lastLogin: {type: Date},
    },
    
    { timestamp: true }
);

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password)
}

const User = new mongoose.model('User', userSchema);
export default User;