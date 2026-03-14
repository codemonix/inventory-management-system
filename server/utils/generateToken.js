import jwt from 'jsonwebtoken';
import logger from './logger.js';

const generateToken = ( id, role ) => {
    logger.info("token generated successfully")
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

};

export default generateToken;