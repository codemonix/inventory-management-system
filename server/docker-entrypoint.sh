#!/bin/sh

mkdir -p /app/uploads
chown -R node:node /app/uploads

exec "$@"