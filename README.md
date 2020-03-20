# Qoodish Web

Qoodish Web app.

## Set up development environment

1. Install [yarn](https://classic.yarnpkg.com/ja/docs/install/#mac-stable)
2. Install [gcloud](https://cloud.google.com/sdk/docs?hl=ja)
3. Get secrets from Secret Manager

```
gcloud beta secrets versions access latest --secret=DOTENV_WEB > .env
```

## Build JavaScripts

```
# Install dependencies
yarn

yarn build
# or
yarn watch:build
```

## Start app

```sh
yarn serve
```

## Test

```sh
yarn jest
```
