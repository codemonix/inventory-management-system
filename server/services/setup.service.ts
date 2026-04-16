
import User from '../models/users.model.js'; // Adjust extension as needed
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import { IFirstAdminInput } from '../types/setup.types.js';




export const checkSetupRequired = async (): Promise<boolean> => {
    // Returns an object with the _id if found, or null
    const userExists = await User.exists({});
    return !userExists;
};

export const provisionFirstAdmin = async (data: IFirstAdminInput) => {
    // Double-check that setup is actually needed
    const isSetupNeeded = await checkSetupRequired();

    if (!isSetupNeeded) {
        throw new AppError('Initial setup is already complete. Admin already exists.', 400);
    }

    // Hash password and prepare the user model
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const adminUser = new User({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
    });

    // Save to database
    await adminUser.save();
    
    // Log the administrative action using custom logger
    logger.info(`[SYSTEM SETUP] First admin user provisioned successfully: ${data.email}`);
    
    return adminUser;
};