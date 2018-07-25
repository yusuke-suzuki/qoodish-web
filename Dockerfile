FROM node:10.7.0-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web
ADD . /qoodish-web
