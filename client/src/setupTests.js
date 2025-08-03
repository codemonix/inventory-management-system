import '@testing-library/jest-dom'

console.log("setupTest")

// Mock the runtime config as it exists in production
global.window = global.window || {};
window.__IMS_CONFIG__ = {
  API_URL: "http://localhost",
  API_PORT: "5000"
};