# Qoodish Web

Qoodish web application.

## Set credentials for development (Admin)

```
gcloud config set project <GCP project ID>

# Create keyring & key
gcloud kms keyrings create qoodish --location=global
gcloud kms keys create qoodish --location=global --keyring=qoodish --purpose=encryption

# Encrypt secrets
gcloud kms encrypt --plaintext-file=.env.development --ciphertext-file=.env.development.enc --location=global --keyring=qoodish --key=qoodish
```

## Set up development environment

```
gcloud config set project <GCP project ID>

# Decrypt secrets
gcloud kms decrypt --ciphertext-file=.env.development.enc --plaintext-file=.env --location=global --keyring=qoodish --key=qoodish
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

```
yarn serve
```

## Test

```
yarn jest
```
