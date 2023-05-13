ARG TAG
FROM x_core:${TAG}

RUN apk add --update --no-cache \
  build-base \
  libffi-dev \
  libtool \
  pkgconfig \
  autoconf \
  automake \
  curl \
  postgresql-dev \
  git \
  gmp-dev \
  patchelf

WORKDIR /deps

RUN pip install pipenv
ENV PIPENV_VENV_IN_PROJECT=1

COPY Pipfile Pipfile.lock ./
ARG DEV
RUN pipenv sync ${DEV:+--dev}

RUN rm Pipfile Pipfile.lock
