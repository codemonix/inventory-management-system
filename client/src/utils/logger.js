const ENABLE_LOGGING = import.meta.env.VITE_LOG_MODE === 'true';

function getCallerInfo() {
    const error = new Error();
    const stack = error.stack.split('\n')[4] || ""; // Get the third line of the stack trace
    const match = stack.match(/at (.+?) \((.+?):(\d+):(\d+)\)/) || stack.match(/at (.+?):(\d+):(\d+)/);
    // console.log('error:', error.stack)
    // console.log('stack:', stack)
    // console.log('match:', match)

    if (!match) return "";
    
    if (match.length === 5) {
        const [_, functionName, filePath, lineNumber, columnNumber] = match;
        // console.log('filePath:', filePath)
        const file = filePath.split('/').pop().split('?')[0]; // Get the file name from the path
        return `${functionName} (${file}:${lineNumber}:${columnNumber})`;
    }

    return '';
};

function getTimestamp() {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { hour12: false});
}

function logBase(level, ...args) {
    if (!ENABLE_LOGGING) return;

    const timestamp = getTimestamp();
    const callerInfo = getCallerInfo();
    // const formattedArgs = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');
    console.log(`[${timestamp}] [${level}] ${callerInfo}`, ...args);
}

export const logInfo = (...args) => logBase('INFO', ...args);
export const logError = (...args) => logBase('ERROR', ...args);
export const logWarning = (...args) => logBase('WARNING', ...args);
export const logDebug = (...args) => logBase('DEBUG', ...args);