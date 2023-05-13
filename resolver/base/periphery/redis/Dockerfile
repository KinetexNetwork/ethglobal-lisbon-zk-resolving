FROM redis:7

# Avoid using default "/data" folder for content since it's used as data
# storage and can be mounted from outside overlapping the content files
WORKDIR /app

COPY content .
