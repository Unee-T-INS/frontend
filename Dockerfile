FROM node:8 AS builder

RUN curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh
RUN mkdir /src /bundle
RUN chown -R node /src /bundle

USER node:node

WORKDIR /src
COPY --chown=node:node . .

RUN meteor npm install
RUN meteor build --architecture os.linux.x86_64 --directory /bundle
RUN cd /bundle/bundle/programs/server && npm install

FROM node:8-slim

USER node:node

COPY --from=builder /bundle /app
WORKDIR /app/bundle

ENV PORT 3000
EXPOSE 3000

CMD ["node", "./main.js"]
