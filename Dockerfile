FROM node:6.14.3

RUN mkdir /qoodish-web
WORKDIR /qoodish-web
ADD . /qoodish-web
RUN yarn
RUN yarn global add firebase-tools
