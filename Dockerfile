FROM node:16-slim as build

FROM gcr.io/distroless/nodejs-debian11:16

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /lib/x86_64-linux-gnu/libz.so.* /lib/x86_64-linux-gnu/

COPY ./next.config.js ./
COPY ./public ./public
COPY ./.next ./.next
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json
COPY ./prisma ./prisma

EXPOSE 8080
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
