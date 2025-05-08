import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export default async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1]; // I should ask about this

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ error: 'User not found!'})
        next();
    } catch (error) {
        log(error.message);
        res.status(403).json({ error: 'Invalid or expired token' });
    };
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only!'});
    next();
}