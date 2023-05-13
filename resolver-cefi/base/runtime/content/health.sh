#!/bin/sh

set -e

HTTP_SERVER_HOST="http://localhost"
HTTP_SERVER_PATH="/api/v0/health"

port="$HEALTH_CHECK_HTTP_PORT"
if [ -z "$port" ]; then
    echo "No HEALTH_CHECK_HTTP_PORT environment variable specified"
    echo "Assuming no HTTP server health check needed!"
    exit 0
fi

url="$HTTP_SERVER_HOST:$port$HTTP_SERVER_PATH"
echo "Checking HTTP server health via getting \"$url\"..."
wget --no-verbose --tries=1 --spider "$url"

echo "HTTP server health check passed!"
