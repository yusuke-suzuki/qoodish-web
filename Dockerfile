FROM node:14.4.0-alpine3.11

RUN mkdir /qoodish-web
WORKDIR /qoodish-web

COPY . /qoodish-web

CMD ["yarn", "serve"]
