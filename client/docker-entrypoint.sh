#!/bin/sh
set -e

# Fill config.js from template
: "${API_BASE:=/api}"
: "${IS_DEMO:=false}"

case "$IS_DEMO" in
  true|false) ;;
  *) echo "IS_DEMO must be 'true' or 'false' (got '$IS_DEMO')" >&2; exit 1 ;;
esac

# Replace placeholders
sed "s|{{API_BASE}}|${API_BASE}|g; s|{{IS_DEMO}}|${IS_DEMO}|g" \
  /usr/share/nginx/html/config.js.tpl > /usr/share/nginx/html/config.js

# Exec the original CMD
exec "$@"
