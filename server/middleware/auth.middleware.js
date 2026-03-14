import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';
import logger from '../utils/logger.js'


export default async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.warn('auth.controller.js -> auth -> No token provided');
        return res.status(403).json({ error: 'No token provided' });
    } 

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            logger.warn('auth.controller.js -> auth -> User not found!');
            return res.status(401).json({ error: 'User not found!'})
        } 
        next();
    } catch (error) {
        logger.error('auth.controller.js -> auth -> Invalid or expired token:', error.message);
        res.status(403).json({ error: 'Invalid or expired token' });
    };
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        logger.warn('auth.controller.js -> isAdmin -> Admin access only!');
        return res.status(403).json({ error: 'Admin access only!'});
    } 
    next();
}

export const isManagerOrAdmin = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'manager' ) {
        next();
    } else {
        logger.warn('auth.controller.js -> isManagerOrAdmin -> Access denied!');
        return res.status(403).json({ error: 'Access denied'});
    }
    
}