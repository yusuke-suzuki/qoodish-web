FROM gcr.io/distroless/nodejs:16

WORKDIR /app

ENV NODE_ENV production

COPY ./next.config.js ./
COPY ./public ./public
COPY ./.next ./.next
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json

EXPOSE 8080
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
