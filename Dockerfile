FROM node:8.11.3-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web
ADD . /qoodish-web
