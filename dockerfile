FROM node:20

WORKDIR /home/node/axerbot

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD [ "node", "dist/index.js" ]
