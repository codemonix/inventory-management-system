import app from './app.js';
import { debugLog } from './utils/logger.js';
import connectDB from './config/db.config.js';

globalThis.log = debugLog; // Make log function globally available
connectDB();


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default server;