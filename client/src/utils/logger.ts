// Env values are strings: Boolean("false") would be true, so compare explicitly
const ENABLE_LOGGING: boolean = import.meta.env.VITE_LOG_MODE === 'true';

function getCallerInfo(errorArg?: unknown): string {
  const error = errorArg instanceof Error ? errorArg : new Error();
  const stackLines = error.stack?.split('\n') ?? [];
  const stack = errorArg instanceof Error ? stackLines[1] : stackLines[4];
  if (!stack) return '';

  const match =
    stack.match(/at (.+?) \((.+?):(\d+):(\d+)\)/) ?? stack.match(/at (.+?):(\d+):(\d+)/);

  if (!match) return '';

  if (match.length === 5) {
    const [, functionName, filePath, lineNumber, columnNumber] = match;
    const file = filePath.split('/').pop()?.split('?')[0] ?? filePath;
    return `${functionName} (${file}:${lineNumber}:${columnNumber})`;
  }

  if (match.length === 4) {
    const [, filePath, lineNumber, columnNumber] = match;
    const file = filePath.split('/').pop()?.split('?')[0] ?? filePath;
    return `${file}:${lineNumber}:${columnNumber}`;
  }

  return '';
}

function getTimestamp(): string {
  const date = new Date();
  return date.toLocaleTimeString('en-US', { hour12: false });
}

function logBase(level: string, ...args: unknown[]): void {
  if (!ENABLE_LOGGING) return;

  const timestamp = getTimestamp();
  const callerInfo = getCallerInfo(args[0]);
  console.log(`[${timestamp}] [${level}] ${callerInfo}`, ...args);
}

export const logInfo = (...args: unknown[]): void => logBase('INFO', ...args);
export const logError = (...args: unknown[]): void => logBase('ERROR', ...args);
export const logWarning = (...args: unknown[]): void => logBase('WARNING', ...args);
export const logDebug = (...args: unknown[]): void => logBase('DEBUG', ...args);

