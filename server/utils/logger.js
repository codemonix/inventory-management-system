import { config } from "../config/config.js";
import path from "path";

export function debugLog(...args) {
    if(!config.enableDebugLog) return;

    const error = new Error();
    // const stackLines = error.stack?.split("\n")[2];

    // console.log('loder.js -> stackLines:', stackLines);

    const stackline = error.stack?.split("\n")[2] || ""; // Get the line where debugLog was called
    const match = stackline.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/);
    // const funcNameMatch = stackline.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/);
    // const funcName = funcNameMatch?.[1] || "unknown function";

    if (match) {
        const funcName = match[1] || "unknown function";
        const fullPath = match[2];
        const fileName = path.basename(fullPath);
        const lineNumber = match[3];
        // const columnNumber = match[4];
        const timestamp = new Date().toString().split("GMT")[0].trim(); // Get the current timestamp without GMT
        // const [, file, line, column ] = match;


        console.log(`log -> [${timestamp}:${fileName} -> ${lineNumber}] (${funcName}):`, ...args);
    } else {
        console.log(`Debug Log (unknown location):`, ...args);
    }
}

export default debugLog