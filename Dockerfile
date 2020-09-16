FROM node:14.11.0-alpine3.12

WORKDIR /qoodish-web

COPY . .

COPY --from=asia-docker.pkg.dev/berglas/berglas/berglas:latest /bin/berglas /bin/berglas

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 8080
CMD ["yarn", "serve"]
