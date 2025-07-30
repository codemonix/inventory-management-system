#!/bin/sh

echo "Generating runtime config..."

cat <<EOF > /usr/share/nginx/html/config.js
window.RUNTIME_CONFIG = {
    VITE_BACKEND_URL: "${VITE_BACKEND_URL}"
};
EOF

echo "Runtime config written:"
cat /usr/share/nginx/config.js

exec "$@"