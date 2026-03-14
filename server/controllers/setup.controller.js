import User from '../models/users.model.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

async function isInitialSetupNeeded() {
    try {
        const userExists = await User.exists({});
        logger.debug("setup.controller -> isInitialSetupNeeded -> userExists:", userExists)
        return !userExists;
    } catch (error) {
        logger.error("setup.controller -> isInitialSetupNeeded -> error:", error.message);
    }
}

export async function needSetup(req, res) {
    const shouldSetup = await isInitialSetupNeeded();
    return res.json({ needSetup: shouldSetup });
};

export async function createFirstAdmin(req, res) {
    const needSetup = await isInitialSetupNeeded();
    if (!needSetup) {
        return res.status(400).json({ error: 'Admin already exists.'});
    }
    
    const { email, name, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
    });
    try {
        await adminUser.save();
        return res.status(201).json({ message: 'Admin user created.' });
    } catch (error) {
        logger.error("setup.controller -> createFirstAdmin -> error:", error.message);
        return res.status(500).json({ message: 'Cannot create first user'})
    }
}