// Template filled at container start by docker-entrypoint.sh to produce /config.js,
// which index.html loads before the app. src/config.ts reads window.__IMS_CONFIG__.
window.__IMS_CONFIG__ = {
  API_URL: "{{API_BASE}}"
};
