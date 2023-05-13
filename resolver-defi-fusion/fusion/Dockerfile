FROM nikolaik/python-nodejs:latest


# Install deps

WORKDIR /app
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --frozen-lockfile


# Compile app

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN yarn build


# Run app

ENV NODE_PATH=./build

CMD [ "yarn", "nodemon", "build/index.js" ]
