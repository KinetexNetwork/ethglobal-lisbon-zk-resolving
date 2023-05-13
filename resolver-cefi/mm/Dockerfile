ARG TAG
FROM x_deps:${TAG} AS deps

COPY Pipfile Pipfile.lock ./
ARG DEV
RUN pipenv sync ${DEV:+--dev}


FROM x_runtime:${TAG} AS runtime

COPY --from=deps /deps/.venv ./.venv
COPY app ./app

ENV SERVICE_APP_MODULE=app
ENV SERVICE_HTTP_PORT=10100
ENV HEALTH_CHECK_HTTP_PORT=10100
CMD [ "./service-server.sh" ]
