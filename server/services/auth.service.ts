import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import generateToken from '../utils/generateToken.js';
import { AppError } from '../errors/AppError.js';

import {
    RegisterDTO,
    LoginDTO,
    AuthResponse,
    UserResponse
} from '../types/auth.types.js';
import { IUser } from '../types/user.types.js';
import logger from '../utils/logger.js';



export async function registerUser( userData: RegisterDTO ): Promise<AuthResponse> {
    const { name, email, password, role = 'user' } = userData;

    const existing = await User.findOne({ email });
    if (existing) {
        logger.error('Email already registered');
        throw new AppError('Email already registered', 409);
    } 

    const hashed = await bcrypt.hash(password, 10);
    const isApproved = process.env.DEFAULT_USER_APPROVED;
    const newUser = new User({ name, email, password: hashed, role, isApproved });
    
    await newUser.save();

    const token = generateToken(newUser._id.toString(), newUser.role);

    return { 
        user: {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            isApproved: newUser.isApproved,
        },
        token,
    };
}

export async function loginUser(credentials: LoginDTO): Promise<AuthResponse> {
    const { email, password } = credentials;
    
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
        logger.warn('Invalid credentials or inactive account');
        throw new AppError('Invalid credentials or inactive account', 401);
    }

    if (!user.isApproved) {
        logger.warn('Account not approved yet');
        throw new AppError('Account not approved yet', 403);
    }

    if (!user.password) {
        logger.warn('User has no password set');
        throw new AppError('Invalid credentials. Please log in with your social provider.', 400);
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
        logger.warn('Invalid credentials');
        throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id.toString(), user.role);

    return { 
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}

export async function getUserById(userId: string): Promise<UserResponse> {
    const user = await User.findById(userId);
    if (!user) {
        logger.warn('User not found');
        throw new AppError('User not found', 404);
    }

    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

export async function getRawUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select('-password');
    return user;
}