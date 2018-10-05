FROM node:8.9.4-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web

COPY package.json /qoodish-web/package.json
COPY yarn.lock /qoodish-web/yarn.lock

RUN apk add --no-cache --virtual=.build-dependencies \
      bash \
      lcms2-dev \
      libpng-dev \
      gcc \
      g++ \
      make \
      autoconf \
      automake
RUN yarn

RUN apk del .build-dependencies

ADD . /qoodish-web
RUN cd ./functions && yarn && cd ../
