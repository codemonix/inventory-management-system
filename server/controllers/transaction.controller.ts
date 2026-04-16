import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service.js'; // Ensure your filename matches!
import logger from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { ITransactionQuery } from '../types/transactions.types.js';


export const fetchLogsHandler = async (
    req: AuthenticatedRequest<any, any, any, ITransactionQuery>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    logger.debug('transaction.controller -> fetchLogsHandler -> req.query:', req.query);
    try {
        const { search, sortBy, sortOrder } = req.query;
        const limit = Math.max(1, parseInt(req.query.limit || '50', 10));
        const skip = Math.max(0, parseInt(req.query.skip || '0', 10));


        logger.debug(`transaction.controller -> fetchLogsHandler -> search: ${search}`);

        const { logs, total } = await transactionService.getTransactionLogs({
            search,
            sortBy,
            sortOrder,
            skip,
            limit,
        });

        res.status(200).json({ 
            success: true, 
            logs, 
            total 
        });
    } catch (error) {
        logger.error('transaction.controller -> fetchLogsHandler -> error');
        next(error); 
    }
}