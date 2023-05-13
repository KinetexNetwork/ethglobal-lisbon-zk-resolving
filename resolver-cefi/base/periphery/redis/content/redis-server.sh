#!/bin/sh

set -e

# Common params regardless mode
BASE_PARAMS="
dir /data
loglevel warning
"

# RDB mode. Snapshots:
# - after 20 seconds if at least 1 change was performed
# - after 10 seconds if at least 10 changes were performed
# - after 5 seconds if at least 100 changes were performed
LOW_DURABILITY_PARAMS="
save 20 1 10 10 5 100
"

# TODO: Fix AOF mode. Using RDB mode (just more frequent) for now
# RDB mode. Snapshots:
# - after 1 second if at least 1 change was performed
HIGH_DURABILITY_PARAMS="
save 1 1
"

# # AOF mode. Backups:
# # - after ~10 minutes if at least 1 change was performed
# # It's highly recommended to ensure that only one instance
# # of Redis has access to the volume when in HD mode
# HIGH_DURABILITY_PARAMS="
# appendonly yes
# appendfsync always
# save 613 1
# "

port="$REDIS_SERVER_PORT"
if [ -z "$port" ]; then
    echo "No REDIS_SERVER_PORT environment variable specified"
    echo "This value is required for running Redis server, failing!"
    exit 1
fi

config_overrides="$BASE_PARAMS"
if [ -z "$REDIS_SERVER_HIGH_DURABILITY" ]; then
    echo "REDIS_SERVER_HIGH_DURABILITY environment variable not specified"
    echo "Redis server will be configured to run in low durability mode"
    config_overrides="$config_overrides$LOW_DURABILITY_PARAMS"
else
    echo "REDIS_SERVER_HIGH_DURABILITY environment variable specified"
    echo "Redis server will be configured to run in high durability mode"
    config_overrides="$config_overrides$HIGH_DURABILITY_PARAMS"
fi

echo "Starting Redis server at \":$port\" with config overrides..."
echo "$config_overrides" | redis-server --port "$port" -
