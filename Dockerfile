FROM node:18.16.0-alpine3.17

WORKDIR /app

COPY package*.json ./
RUN apk --no-cache add --virtual .gyp python3 make g++ \
    && npm install \
    && apk del .gyp

COPY . .
COPY .env.production .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "prod"]
