FROM node:20-alpine

WORKDIR /home/node/axerbot

RUN apk add pango-dev g++ make jpeg-dev giflib-dev librsvg-dev pkgconfig
RUN apk add --no-cache python3 py3-pip

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD [ "node", "dist/index.js" ]
