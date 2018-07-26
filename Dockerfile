FROM node:8.11.3

RUN mkdir /qoodish-web
WORKDIR /qoodish-web
ADD . /qoodish-web
RUN yarn
RUN yarn global add firebase-tools
