FROM node:13.5.0-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web

COPY . /qoodish-web

CMD ["yarn", "serve"]
