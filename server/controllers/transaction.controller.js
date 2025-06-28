import { getTransactionLogs } from "../services/transactionService";
import log from '../utils/logger';


export async function fetchLogsHandler(req, res) {
    try {
        const { search, sortBy, sortOrder, skip, limit } = req.query
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