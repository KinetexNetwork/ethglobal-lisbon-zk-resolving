#!/bin/sh

set -e

HTTP_SERVER_HOST="http://localhost"
HTTP_SERVER_PATH=""
HTTP_SERVER_PORT="80"

url="$HTTP_SERVER_HOST:$HTTP_SERVER_PORT$HTTP_SERVER_PATH"
echo "Checking HTTP server health via getting \"$url\"..."
wget --no-verbose --tries=1 --spider "$url"

echo "HTTP server health check passed!"
