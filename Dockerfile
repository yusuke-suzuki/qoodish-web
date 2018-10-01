FROM node:6.14.4-alpine as node6
FROM node:8.9.4-alpine

RUN mkdir /qoodish-web
WORKDIR /qoodish-web

COPY --from=node6 /usr/local/bin/node /usr/local/bin/node6
COPY --from=node6 /usr/local/include/node /usr/local/include/node6

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
RUN yarn --ignore-engines

RUN apk del .build-dependencies

ADD . /qoodish-web
RUN cd ./functions && yarn && cd ../
