FROM node:16-alpine

WORKDIR /app

COPY . .
RUN npm run build

USER node

CMD ["npm","run","start"]

EXPOSE 3000