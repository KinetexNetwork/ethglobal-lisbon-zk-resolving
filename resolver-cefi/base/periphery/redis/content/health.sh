#!/bin/sh

set -e

port="$HEALTH_CHECK_REDIS_PORT"
if [ -z "$port" ]; then
    echo "No HEALTH_CHECK_REDIS_PORT environment variable specified"
    echo "Assuming no Redis health check needed!"
    exit 0
fi

echo "Checking Redis health via pinging \":$port\"..."
redis-cli -p "$port" -e --raw INCR ping

echo "Redis health check passed!"
