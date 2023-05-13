#!/bin/sh

set -e

module="$SERVICE_APP_MODULE"
port="$SERVICE_HTTP_PORT"
if [ -z "$module" ] || [ -z "$port" ]; then
    echo "No SERVICE_APP_MODULE or SERVICE_HTTP_PORT environment variable specified"
    echo "These values are required for running service HTTP server, failing!"
    exit 1
fi

echo "Starting \"$module\" service HTTP server at \":$port\"..."
python -m uvicorn "$module:app" --host 0.0.0.0 --port "$port"
