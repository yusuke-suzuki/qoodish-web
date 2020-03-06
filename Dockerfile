FROM node:13.10.1-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web

COPY . /qoodish-web

CMD ["yarn", "serve"]
