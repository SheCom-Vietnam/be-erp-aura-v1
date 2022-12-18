FROM node:16-alpine

WORKDIR /app

COPY . .
RUN npm run build

USER node

CMD ["npm","run","prod"]

EXPOSE 3000
