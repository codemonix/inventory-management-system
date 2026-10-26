import rateLimit from 'express-rate-limit';

// Brute-force protection for credential endpoints. Disabled in tests so suites can log in freely.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Too many attempts, please try again later.' },
});
