import { getTransactionLogs } from "../services/transactionService.js";
import log, { debugLog } from '../utils/logger.js';


export async function fetchLogsHandler(req, res) {
    try {
        const { search, sortBy, sortOrder, skip, limit } = req.query
        debugLog("search:", search)
        const { logs, total } = await getTransactionLogs({
            search,
            sortBy,
            sortOrder,
            skip,
            limit,
        });
        res.json({ logs, total });
    } catch (error) {
        log('Error fetching transaction logs:',error.message);
        res.status(500).json({ message: 'Failed to loag Transaction logs' }); 
    }
}