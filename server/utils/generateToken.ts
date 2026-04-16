import jwt from 'jsonwebtoken';
import logger from './logger.js';
import { UserRole, ITokenPayload } from '../types/auth.types.js';
import { AppError } from '../errors/AppError.js';

const generateToken = ( id: string, role: UserRole ): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger.error("❌ FATAL: JWT_SECRET is not defined in environment variables.")
        throw new AppError('Server configuration error. Cannot generate token.', 500);
    }

    const payload: ITokenPayload = { id, role };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    logger.debug(`generateToken.ts -> Token successfully generated for user: ${id}`);
    return token

};

export default generateToken;