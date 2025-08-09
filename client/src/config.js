import { logInfo } from "./utils/logger";

export function getApiBaseUrl() {
    if (import.meta.env.DEV) {
        logInfo("dev mode active")
        return `${import.meta.env.VITE_API_BASE_URL}:${import.meta.env.VITE_API_PORT}/api/`;
    }

    // For production/test
    const url = typeof window !== "undefined" ? window.__IMS_CONFIG__?.API_URL : null;
    const port = typeof window !== "undefined" ? window.__IMS_CONFIG__?.API_PORT : null;
    logInfo("getApiBaseUrl: url, port", url, port)
    if (!url) {
        throw new Error("Missing API_URL configuration!");
    }

    return port ? `${url}:${port}` : `${url}`;
}


