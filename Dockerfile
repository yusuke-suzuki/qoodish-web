FROM node:14.4.0-alpine3.12

WORKDIR /qoodish-web

COPY . /qoodish-web

CMD ["yarn", "serve"]
