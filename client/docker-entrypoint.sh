#!/bin/sh
set -e

# Fill config.js from template
: "${API_BASE:=/api}"

# Replace placeholders
sed "s|{{API_BASE}}|${API_BASE}|g" \
  /usr/share/nginx/html/config.js.tpl > /usr/share/nginx/html/config.js

# Exec the original CMD
exec "$@"
