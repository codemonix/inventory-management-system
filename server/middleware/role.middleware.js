import logger from "../utils/logger";


export function requiredRole(...allowedRoles) {
    return (req, res, next) => {
        if ( !allowedRoles.includes(req.user.role)) {
            logger.warn("auth.controller.js -> requiredRole -> Access denied", req.user.email)
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}