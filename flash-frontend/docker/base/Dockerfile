FROM node:18-alpine as builder

RUN apk add --update --no-cache \
  build-base \
  git \
  bash


# Install deps & prepare to build

WORKDIR /app
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY public ./public
COPY .env-cmdrc ./.env-cmdrc
COPY config-overrides.js ./config-overrides.js
