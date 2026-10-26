import { isApiError } from '../api/api';
import { getBackendMessage } from './backendMessage';

// Best human-readable message for anything a catch block can receive:
// the server's { message } for API errors, otherwise Error.message, otherwise the fallback.
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (isApiError(error)) return getBackendMessage(error) ?? error.message ?? fallback;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
};
