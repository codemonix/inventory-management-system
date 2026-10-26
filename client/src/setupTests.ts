import '@testing-library/jest-dom';

// Mock the runtime config as it exists in production
window.__IMS_CONFIG__ = {
  API_URL: 'http://localhost',
  API_PORT: '5000',
};

