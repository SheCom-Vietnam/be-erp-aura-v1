FROM public.ecr.aws/docker/library/node:16-alpine

WORKDIR /app

COPY . .
RUN npm run build

USER node

CMD ["npm","run","pro"]

EXPOSE 3000