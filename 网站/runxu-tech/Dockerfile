FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8765

COPY package.json ./
COPY server.js questionnaire.js index.html questionnaire.html styles.css robots.txt ./
COPY assets ./assets
COPY config ./config
COPY scripts ./scripts

RUN apk add --no-cache sqlite
RUN mkdir -p /app/data/exports

EXPOSE 8765

CMD ["node", "server.js"]
