/// <reference types="vite/client" />

declare global {
  // Injected by vite.config.ts `define` from package.json
  const __APP_VERSION__: string;

  interface Window {
    __IMS_CONFIG__?: {
      API_URL?: string;
      API_PORT?: string | number;
    };
    env?: {
      IS_DEMO?: boolean;
    };
  }
}

export {};