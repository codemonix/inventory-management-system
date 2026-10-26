import type { AxiosError } from 'axios';

export function getBackendMessage(error: AxiosError): string | undefined {
  const data: unknown = error.response?.data;
  if (!data || typeof data !== 'object') return undefined;
  if (!('message' in data)) return undefined;
  const msg = (data as { message?: unknown }).message;
  return typeof msg === 'string' ? msg : undefined;
}

