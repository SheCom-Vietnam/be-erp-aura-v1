# Khi deploy chỉnh lại 2 lệnh rem bên dưới

FROM node:20.3.1-alpine3.17

WORKDIR /app

COPY package*.json ./
RUN apk --no-cache add --virtual .gyp python3 make g++ \
    && npm install \
    && apk del .gyp

COPY . .

COPY .env.production .
# COPY .env.dev .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "prod"]
# CMD ["npm", "run", "dev"]
