#!/bin/sh

mkdir -p /app/uploads
if [ ! -f /app/uploads/items/default.jpg ] ; then
    cp tests/default.jpg ./uploads/items/
fi
chown -R node:node /app/uploads

exec "$@"