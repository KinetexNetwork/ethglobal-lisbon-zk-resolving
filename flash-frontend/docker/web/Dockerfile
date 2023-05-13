ARG TAG
FROM kinetex_flash_base:${TAG} AS base


# Build web

COPY .env ./.env
RUN yarn build


# Create static content host

FROM nginx:stable-alpine
COPY --from=base /app/build /usr/share/nginx/html

# Replace default nginx container config
COPY docker/web/nginx.conf /etc/nginx/nginx.conf

# Add health check script
COPY docker/web/health.sh ./health.sh
