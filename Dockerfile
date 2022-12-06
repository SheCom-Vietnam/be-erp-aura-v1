FROM alpine:3.15

ENV NODE_VERSION 16.18.1

WORKDIR /app

COPY . .
RUN npm run build

USER node

CMD ["npm","run","start"]

EXPOSE 3000