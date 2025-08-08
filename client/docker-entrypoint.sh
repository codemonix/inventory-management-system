#!/bin/sh
set -e

# Fill runtime-config.js from template
: "${API_BASE:=/api}"
: "${BASE_PATH:=}"

# Replace placeholders
sed "s|{{API_BASE}}|${API_BASE}|g; s|{{BASE_PATH}}|${BASE_PATH}|g" \
  /usr/share/nginx/html/runtime-config.js.tpl > /usr/share/nginx/html/runtime-config.js

# Exec the original CMD
exec "$@"
