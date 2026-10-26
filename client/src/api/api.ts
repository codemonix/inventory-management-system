import axios, { AxiosError } from 'axios';
import { getToken, removeToken } from '../utils/auth';
import { logDebug, logError } from '../utils/logger';
import { getApiBaseUrl } from '../config';

type ApiErrorWithUserMessage = AxiosError & { userMessage?: string };

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logDebug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    logError('[API Request Setup Error]', error.message);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: ApiErrorWithUserMessage) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logError('[API Timeout]', error.message);
      error.userMessage = 'The server took too long to respond. Please try again.';
    } else if (error.response?.status === 401) {
      // Wrong credentials on login/register are normal 401s: let the form show the message.
      // Only a rejected stored token means the session is over.
      const isAuthAttempt = /\/auth\/(login|register)$/.test(error.config?.url ?? '');
      const sentToken = Boolean(error.config?.headers?.Authorization);
      if (!isAuthAttempt && sentToken) {
        logError('[API 401] Unauthorized. Token may be expired.');
        removeToken();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?reason=expired';
        }
      }
    } else if ((error.response?.status ?? 0) >= 500) {
      logError('[API 500+] Server Error:', error.response?.data);
      error.userMessage = 'An internal server error occurred. Our team has been notified.';
    } else if (!error.response) {
      logError('[API Network Error]', error.message);
      error.userMessage = 'Network error. Please check your internet connection.';
    }
    return Promise.reject(error);
  },
);

export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

export default api;

